import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const okrsRoutes = new Hono<AppEnv>();

okrsRoutes.use("*", authMiddleware);
okrsRoutes.use("*", tenancyMiddleware);

okrsRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const prisma = new PrismaClient();

  try {
    const objectives = await prisma.objectives.findMany({
      where: { tenant_id: tenantId },
      include: {
        key_results: true,
      },
      orderBy: { target_date: "asc" },
    });

    // Auto calculate progress wrapper
    const data = objectives.map((obj: any) => {
      let totalProgress = 0;
      if (obj.key_results && obj.key_results.length > 0) {
        const sum = obj.key_results.reduce((acc: number, kr: any) => {
          const krProgress = Math.min(
            (Number(kr.current_val) / Number(kr.target_val)) * 100,
            100,
          );
          return acc + krProgress * Number(kr.weight);
        }, 0);
        const totalWeight = obj.key_results.reduce(
          (acc: number, kr: any) => acc + Number(kr.weight),
          0,
        );
        totalProgress = totalWeight > 0 ? sum / totalWeight : 0;
      }
      return { ...obj, progress: Math.round(totalProgress) };
    });

    await prisma.$disconnect();
    return c.json(data);
  } catch (err: any) {
    await prisma.$disconnect();
    return c.json({ error: err.message }, 500);
  }
});

okrsRoutes.post("/", async (c) => {
  const tenantId = c.get("tenantId");
  const body = await c.req.json();
  const prisma = new PrismaClient();

  try {
    const objective = await prisma.objectives.create({
      data: {
        tenant_id: tenantId,
        title: body.title,
        description: body.description,
        target_date: new Date(body.target_date),
        key_results: {
          create: body.key_results.map((kr: any) => ({
            tenant_id: tenantId,
            title: kr.title,
            target_val: kr.target_val,
            unit: kr.unit,
            weight: kr.weight || 1,
          })),
        },
      },
      include: { key_results: true },
    });

    await prisma.$disconnect();
    return c.json(objective, 201);
  } catch (err: any) {
    await prisma.$disconnect();
    return c.json({ error: err.message }, 500);
  }
});

okrsRoutes.put("/:objectiveId/kr/:krId", async (c) => {
  const tenantId = c.get("tenantId");
  const krId = c.req.param("krId");
  const body = await c.req.json();
  const prisma = new PrismaClient();

  try {
    const updated = await prisma.key_results.updateMany({
      where: { id: krId, tenant_id: tenantId },
      data: {
        current_val: body.current_val,
        updated_at: new Date(),
      },
    });

    await prisma.$disconnect();
    return c.json({ success: true, updated: updated.count });
  } catch (err: any) {
    await prisma.$disconnect();
    return c.json({ error: err.message }, 500);
  }
});

export default okrsRoutes;
