// supabase/functions/mint-card-token/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT } from "https://esm.sh/jose@5.6.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // for dev; later you can restrict to your domain
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // 1) Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2) Require auth header from Supabase client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const jwtSecret = Deno.env.get("VERIFY_JWT_SECRET")!;

    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "VERIFY_JWT_SECRET not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate caller identity (must be logged in)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({
        error: "Unauthorized",
        details: userError?.message || "No user found in session",
        debug_header: authHeader.substring(0, 20) + "..."
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const card_id = body.card_id as string | undefined;

    if (!card_id) {
      return new Response(JSON.stringify({ error: "card_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch card to include token_version
    const { data: card, error: cardError } = await supabase
      .from("student_cards")
      .select("id, token_version, status")
      .eq("id", card_id)
      .single();

    if (cardError || !card) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (card.status !== "ACTIVE") {
      return new Response(JSON.stringify({ error: "Card not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mint short-lived token (15 minutes)
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 15 * 60;

    const token = await new SignJWT({
      card_id: card.id,
      token_version: card.token_version,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .setAudience("ims-is-verify")
      .setIssuer("ims-is")
      .sign(new TextEncoder().encode(jwtSecret));

    return new Response(JSON.stringify({ token, expires_in: 900 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error", detail: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});