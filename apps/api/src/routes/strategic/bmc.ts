import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const bmcRoutes = new Hono<AppEnv>();

bmcRoutes.use("*", authMiddleware);
bmcRoutes.use("*", tenancyMiddleware);

bmcRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const prisma = new PrismaClient();

  try {
    const canvas = await prisma.business_model_canvas.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { updated_at: "desc" },
    });
    await prisma.$disconnect();

    if (!canvas) {
      // Default empty structure
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
  } catch (err: any) {
    await prisma.$disconnect();
    return c.json({ error: err.message }, 500);
  }
});

bmcRoutes.put("/", async (c) => {
  const tenantId = c.get("tenantId");
  const body = await c.req.json();
  const prisma = new PrismaClient();

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

    await prisma.$disconnect();
    return c.json(result);
  } catch (err: any) {
    await prisma.$disconnect();
    return c.json({ error: err.message }, 500);
  }
});

export default bmcRoutes;
