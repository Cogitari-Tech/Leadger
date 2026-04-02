import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { validateBody } from "../../middleware/validate";
import { updateBmcSchema } from "../../schemas";
import { AppEnv } from "../../types/env";

const bmcRoutes = new Hono<AppEnv>();

bmcRoutes.use("*", authMiddleware);
bmcRoutes.use("*", tenancyMiddleware);

bmcRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const canvas = await prisma.business_model_canvas.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { updated_at: "desc" },
    });

    if (!canvas) {
      return c.json({
        key_partners: [],
        key_activities: [],
        key_resources: [],
        value_props: [],
        customer_rels: [],
        channels: [],
        customer_segs: [],
        cost_structure: [],
        revenue_streams: [],
      });
    }

    return c.json(canvas);
  } catch (err) {
    console.error("Error fetching BMC:", err);
    return c.json({ error: "Failed to fetch Business Model Canvas" }, 500);
  }
});

bmcRoutes.put("/", validateBody(updateBmcSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const body = c.get("validatedBody");

  try {
    const current = await prisma.business_model_canvas.findFirst({
      where: { tenant_id: tenantId },
    });

    let result;
    if (current) {
      result = await prisma.business_model_canvas.update({
        where: { id: current.id },
        data: {
          key_partners: body.key_partners,
          key_activities: body.key_activities,
          key_resources: body.key_resources,
          value_props: body.value_props,
          customer_rels: body.customer_rels,
          channels: body.channels,
          customer_segs: body.customer_segs,
          cost_structure: body.cost_structure,
          revenue_streams: body.revenue_streams,
          updated_at: new Date(),
        },
      });
    } else {
      result = await prisma.business_model_canvas.create({
        data: {
          tenant_id: tenantId,
          key_partners: body.key_partners || [],
          key_activities: body.key_activities || [],
          key_resources: body.key_resources || [],
          value_props: body.value_props || [],
          customer_rels: body.customer_rels || [],
          channels: body.channels || [],
          customer_segs: body.customer_segs || [],
          cost_structure: body.cost_structure || [],
          revenue_streams: body.revenue_streams || [],
        },
      });
    }

    return c.json(result);
  } catch (err) {
    console.error("Error updating BMC:", err);
    return c.json({ error: "Failed to update Business Model Canvas" }, 500);
  }
});

export default bmcRoutes;
