// Stand-in for the two Deno edge functions (mint-card-token, verify-card).
// Uses real HMAC-SHA256 signing via Web Crypto so the "tamper-evident QR
// token" flow is functionally genuine, not just a placeholder.

import { getDb, persist, uid, type DbShape } from "./store";

const DEMO_SECRET = "ims-is-demo-secret-do-not-use-in-production";

async function hmacKey() {
    return crypto.subtle.importKey("raw", new TextEncoder().encode(DEMO_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toB64Url(bytes: Uint8Array): string {
    let str = "";
    bytes.forEach((b) => (str += String.fromCharCode(b)));
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64Url(s: string): Uint8Array {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const str = atob(b64);
    return Uint8Array.from([...str].map((c) => c.charCodeAt(0)));
}

async function signToken(payload: Record<string, unknown>): Promise<string> {
    const payloadB64 = toB64Url(new TextEncoder().encode(JSON.stringify(payload)));
    const key = await hmacKey();
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
    return `${payloadB64}.${toB64Url(new Uint8Array(sig))}`;
}

async function verifyToken(token: string): Promise<{ valid: boolean; payload?: Record<string, unknown> }> {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return { valid: false };
    const key = await hmacKey();
    const ok = await crypto.subtle.verify("HMAC", key, fromB64Url(sigB64) as BufferSource, new TextEncoder().encode(payloadB64));
    if (!ok) return { valid: false };
    try {
        const payload = JSON.parse(new TextDecoder().decode(fromB64Url(payloadB64)));
        return { valid: true, payload };
    } catch {
        return { valid: false };
    }
}

// Loosely typed return (matching the original untyped supabase-js client's
// `functions.invoke()` contract) since this one entry point fans out to
// functions with different response shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function invokeFunction(name: string, opts?: { body?: { card_id?: string } }): Promise<{ data: any; error: any }> {
    if (name === "mint-card-token") return mintCardToken(opts?.body?.card_id);
    if (name.startsWith("verify-card")) {
        const qIndex = name.indexOf("?");
        const params = new URLSearchParams(qIndex >= 0 ? name.slice(qIndex + 1) : "");
        return verifyCard(params.get("t"));
    }
    return { data: null, error: { message: `Unknown function: ${name}` } };
}

async function mintCardToken(cardId?: string) {
    if (!cardId) return { data: null, error: { message: "card_id is required" } };
    const db = getDb();
    const card = db.student_cards.find((c) => c.id === cardId);
    if (!card) return { data: null, error: { message: "Card not found" } };
    if (card.status !== "ACTIVE") return { data: null, error: { message: "Card not active" } };

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 15 * 60;
    const token = await signToken({ card_id: card.id, token_version: card.token_version, iat, exp });
    return { data: { token, expires_in: 900 }, error: null };
}

function logScan(db: DbShape, args: { card_id?: string | null; student_id?: string | null; institution_id?: string | null; result: string; reason?: string | null }) {
    db.verification_requests.push({
        id: uid(),
        card_id: args.card_id ?? null,
        student_id: args.student_id ?? null,
        institution_id: args.institution_id ?? null,
        verified_by: null,
        verification_type: "QR_SCAN",
        result: { status: args.result },
        reason: args.reason ?? null,
        user_agent: null,
        device_id: null,
        client_ip: null,
        created_at: new Date().toISOString(),
    });
    persist();
}

async function verifyCard(token: string | null) {
    const db = getDb();
    if (!token) return { data: { valid: false, reason: "missing_token" }, error: null };

    const { valid, payload } = await verifyToken(token);
    if (!valid || !payload) return { data: { valid: false, reason: "invalid_or_expired_token" }, error: null };
    if (typeof payload.exp === "number" && Math.floor(Date.now() / 1000) > payload.exp) {
        return { data: { valid: false, reason: "invalid_or_expired_token" }, error: null };
    }

    const card = db.student_cards.find((c) => c.id === payload.card_id);
    if (!card) {
        logScan(db, { card_id: payload.card_id as string, result: "INVALID", reason: "card_not_found" });
        return { data: { valid: false, reason: "card_not_found" }, error: null };
    }

    if (card.token_version !== payload.token_version) {
        logScan(db, { card_id: card.id as string, student_id: card.student_id as string, institution_id: card.institution_id as string, result: "INVALID", reason: "token_version_mismatch" });
        return { data: { valid: false, reason: "token_version_mismatch" }, error: null };
    }

    if (card.status !== "ACTIVE") {
        logScan(db, { card_id: card.id as string, student_id: card.student_id as string, institution_id: card.institution_id as string, result: "INVALID", reason: `card_${String(card.status).toLowerCase()}` });
        return { data: { valid: false, reason: "card_not_active" }, error: null };
    }

    const student = db.students.find((s) => s.id === card.student_id);
    const institution = db.institutions.find((i) => i.id === card.institution_id);
    const visa = db.visas
        .filter((v) => v.student_id === card.student_id)
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];

    const ledger = db.blockchain_ledger
        .filter((l) => l.card_id === card.id)
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];

    const integrity_ok = !!ledger && ledger.record_hash === card.record_hash && ledger.blockchain_tx_id === card.blockchain_tx_id;

    logScan(db, {
        card_id: card.id as string,
        student_id: card.student_id as string,
        institution_id: card.institution_id as string,
        result: integrity_ok ? "VALID" : "INVALID",
        reason: integrity_ok ? null : "integrity_check_failed",
    });

    return {
        data: {
            valid: integrity_ok,
            integrity_ok,
            institution: institution?.name ?? null,
            visa_status: visa?.status ?? "UNKNOWN",
            visa_end_date: visa?.end_date ?? null,
            student_nationality: student?.nationality ?? null,
        },
        error: null,
    };
}
