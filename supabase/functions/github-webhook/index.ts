import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("GITHUB_WEBHOOK_SECRET") ?? "";

// Pre-compute the HMAC key from the secret
async function importKey(secret: string) {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify", "sign"],
  );
}

// Convert hex string to Uint8Array
function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function verifySignature(signature: string, payloadBody: string) {
  if (!signature.startsWith("sha256=")) return false;
  const sigHex = signature.slice(7);
  const sigBytes = hexToBytes(sigHex);
  const key = await importKey(WEBHOOK_SECRET);
  const enc = new TextEncoder();
  return await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    enc.encode(payloadBody),
  );
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256") || "";

  // Verify webhook signature
  if (!(await verifySignature(signature, rawBody))) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eventType = req.headers.get("x-github-event") || "unknown";
  const payload = JSON.parse(rawBody);

  // Exclude events we don't care about
  if (["ping", "meta"].includes(eventType)) {
    return new Response(JSON.stringify({ success: true, message: "pong" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // We need to associate the webhook event with a tenant.
  // We can look up the tenant by the installation_id
  const installationId = payload.installation?.id;
  if (!installationId) {
    return new Response(
      JSON.stringify({ error: "No installation ID in payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { data: installationData } = await supabase
    .from("github_installations")
    .select("tenant_id")
    .eq("installation_id", installationId)
    .single();

  if (!installationData) {
    return new Response(
      JSON.stringify({ error: "Installation not registered to any tenant" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const tenantId = installationData.tenant_id;

  // Insert raw event into github_governance_events
  await supabase.from("github_governance_events").insert({
    tenant_id: tenantId,
    event_type: eventType,
    source: "github_webhook",
    severity: "info",
    description: `Received GitHub event: ${eventType} from ${payload.repository?.full_name || "organization"}`,
    raw_payload: payload,
    processed: false,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
