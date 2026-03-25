import type { Context, Next } from "hono";
import { supabaseAdmin } from "../config/supabase";
import type { AppEnv } from "../types/env";

export async function tenancyMiddleware(c: Context<AppEnv>, next: Next) {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  // The client usually sends the target tenantId in a header if they belong to multiple,
  // or we can fetch the default one. Leadgers platform requires x-tenant-id header.
  const requestedTenantId = c.req.header("x-tenant-id");

  let query = supabaseAdmin
    .from("tenant_members")
    .select("tenant_id, roles(name), status")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (requestedTenantId) {
    query = query.eq("tenant_id", requestedTenantId);
  }

  const { data: memberships, error } = await query;

  if (error || !memberships || memberships.length === 0) {
    return c.json(
      { error: "No active tenant membership found or access denied" },
      403,
    );
  }

  // Use the requested one or fallback to the first active membership
  const membership = memberships[0];

  // O Prisma adapter e outras funções vão usar isso para isolamento via RLS explícito ou WHERE
  c.set("tenantId", membership.tenant_id);
  c.set("userRole", (membership.roles as any)?.name || "member");

  await next();
}
