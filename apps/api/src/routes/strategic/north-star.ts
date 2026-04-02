import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { validateBody } from "../../middleware/validate";
import { createNorthStarSchema } from "../../schemas";
import { AppEnv } from "../../types/env";

const northStarRoutes = new Hono<AppEnv>();

northStarRoutes.use("*", authMiddleware);
northStarRoutes.use("*", tenancyMiddleware);

northStarRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const metrics = await prisma.north_star_metrics.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });

    if (!metrics) {
      return c.json({ error: "North Star Metric not found" }, 404);
    }

    return c.json(metrics);
  } catch (err) {
    console.error("Error fetching North Star metric:", err);
    return c.json({ error: "Failed to fetch North Star metric" }, 500);
  }
});

northStarRoutes.post("/", validateBody(createNorthStarSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const body = c.get("validatedBody");

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

    return c.json(newMetric, 201);
  } catch (err) {
    console.error("Error creating North Star metric:", err);
    return c.json({ error: "Failed to create North Star metric" }, 500);
  }
});

export default northStarRoutes;
