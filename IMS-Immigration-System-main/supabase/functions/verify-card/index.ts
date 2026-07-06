import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://esm.sh/jose@5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VERIFY_JWT_SECRET = Deno.env.get("VERIFY_JWT_SECRET")!;

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("t");
    if (!token) {
      return new Response(JSON.stringify({ valid: false, reason: "missing_token" }), { status: 400 });
    }

    // 1) Verify JWT signature + exp + aud + iss
    let payload: any;
    try {
      const result = await jose.jwtVerify(token, new TextEncoder().encode(VERIFY_JWT_SECRET), {
        audience: "ims-is-verify",
        issuer: "ims-is",
      });
      payload = result.payload;
    } catch {
      return new Response(JSON.stringify({ valid: false, reason: "invalid_or_expired_token" }), { status: 401 });
    }

    const card_id = payload.card_id as string;
    const token_version = payload.token_version as number;

    // 2) Load card + student + institution + visa (minimal set)
    const { data: card, error: cardErr } = await supabase
      .from("student_cards")
      .select(`
        id, token_version, status, record_hash, blockchain_tx_id,
        student:students(id, full_name, nationality),
        institution:institutions(id, name),
        visa:visas(status, end_date)
      `)
      .eq("id", card_id)
      .order("created_at", { referencedTable: "visas", ascending: false })
      .limit(1, { referencedTable: "visas" })
      .single();

    if (cardErr || !card) {
      await logScan(supabase, { card_id, result: "INVALID", reason: "card_not_found" });
      return new Response(JSON.stringify({ valid: false, reason: "card_not_found" }), { status: 404 });
    }

    // 3) Token version check (prevents old QR reuse after replacement)
    if (card.token_version !== token_version) {
      await logScan(supabase, { card_id, student_id: card.student?.id, institution_id: card.institution?.id, result: "INVALID", reason: "token_version_mismatch" });
      return new Response(JSON.stringify({ valid: false, reason: "token_version_mismatch" }), { status: 409 });
    }

    // 4) Status checks
    if (card.status !== "ACTIVE") {
      await logScan(supabase, { card_id, student_id: card.student?.id, institution_id: card.institution?.id, result: "INVALID", reason: `card_${card.status.toLowerCase()}` });
      return new Response(JSON.stringify({ valid: false, reason: "card_not_active" }), { status: 409 });
    }

    const visa = Array.isArray(card.visa) ? card.visa[0] : card.visa;
    const visa_status = visa?.status ?? "UNKNOWN";
    const visa_end = visa?.end_date ?? null;

    // 5) Tamper-evidence check: compare to ledger entry (“blockchain”)
    const { data: ledger, error: ledErr } = await supabase
      .from("blockchain_ledger")
      .select("record_hash, blockchain_tx_id")
      .eq("card_id", card_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const integrity_ok =
      !ledErr &&
      !!ledger &&
      ledger.record_hash === card.record_hash &&
      ledger.blockchain_tx_id === card.blockchain_tx_id;

    const valid = integrity_ok;

    // 6) Log scan
    await logScan(supabase, {
      card_id,
      student_id: card.student?.id,
      institution_id: card.institution?.id,
      result: valid ? "VALID" : "INVALID",
      reason: valid ? null : "integrity_check_failed",
    });

    // 7) Return minimal data (privacy-preserving)
    return new Response(
      JSON.stringify({
        valid,
        integrity_ok,
        institution: card.institution?.name ?? null,
        visa_status,
        visa_end_date: visa_end,
        student_nationality: card.student?.nationality ?? null,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ valid: false, reason: "server_error", error: String(e) }), { status: 500 });
  }
});

async function logScan(supabase: any, args: any) {
  try {
    await supabase.from("verification_requests").insert({
      card_id: args.card_id ?? null,
      student_id: args.student_id ?? null,
      institution_id: args.institution_id ?? null,
      result: args.result,
      reason: args.reason,
      user_agent: null,
      device_id: null,
      client_ip: null,
    });
  } catch {
    // don't break verification if logging fails
  }
}