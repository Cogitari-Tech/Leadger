import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";
import { createScopedClient } from "../../config/supabase";

const aiConfigRoutes = new Hono<AppEnv>();

aiConfigRoutes.use("*", authMiddleware);
aiConfigRoutes.use("*", tenancyMiddleware);

/** GET /  — Returns current ai_settings for the tenant */
aiConfigRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const token = c.get("accessToken");
  const supabase = createScopedClient(token);

  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("ai_settings")
      .eq("id", tenantId)
      .single();

    if (error) throw error;

    return c.json(
      data?.ai_settings ?? {
        proactivity_level: "medium",
        tone: "professional",
        insight_focus: ["finance", "burn_rate"],
      },
    );
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    return c.json({ error: "Failed to fetch AI settings" }, 500);
  }
});

/** PATCH /  — Updates ai_settings JSONB for the tenant */
aiConfigRoutes.patch("/", async (c) => {
  const tenantId = c.get("tenantId");
  const userRole = c.get("userRole");
  const token = c.get("accessToken");

  if (!["owner", "admin"].includes(userRole)) {
    return c.json({ error: "Insufficient permissions" }, 403);
  }

  const supabase = createScopedClient(token);

  try {
    const body = await c.req.json();

    const allowedKeys = ["proactivity_level", "tone", "insight_focus"];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        sanitized[key] = body[key];
      }
    }

    // Merge with existing settings
    const { data: current } = await supabase
      .from("tenants")
      .select("ai_settings")
      .eq("id", tenantId)
      .single();

    const merged = { ...(current?.ai_settings ?? {}), ...sanitized };

    const { error } = await supabase
      .from("tenants")
      .update({ ai_settings: merged })
      .eq("id", tenantId);

    if (error) throw error;

    return c.json(merged);
  } catch (error) {
    console.error("Error updating AI settings:", error);
    return c.json({ error: "Failed to update AI settings" }, 500);
  }
});

export default aiConfigRoutes;
