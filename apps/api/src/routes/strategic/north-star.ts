import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const northStarRoutes = new Hono<AppEnv>();

northStarRoutes.use("*", authMiddleware);
northStarRoutes.use("*", tenancyMiddleware);

northStarRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const prisma = new PrismaClient();

  try {
    const metrics = await prisma.north_star_metrics.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });
    await prisma.$disconnect();

    if (!metrics) {
      return c.json({ error: "North Star Metric not found" }, 404);
    }

    return c.json(metrics);
  } catch (err: any) {
    await prisma.$disconnect();
    return c.json({ error: err.message }, 500);
  }
});

northStarRoutes.post("/", async (c) => {
  const tenantId = c.get("tenantId");
  const body = await c.req.json();
  const prisma = new PrismaClient();

  try {
    const newMetric = await prisma.north_star_metrics.create({
      data: {
        tenant_id: tenantId,
        name: body.name,
        target_value: body.target_value,
        current_value: body.current_value,
        unit: body.unit,
      },
    });

    await prisma.$disconnect();
    return c.json(newMetric, 201);
  } catch (err: any) {
    await prisma.$disconnect();
    return c.json({ error: err.message }, 500);
  }
});

export default northStarRoutes;
