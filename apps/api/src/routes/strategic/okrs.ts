import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { validateBody } from "../../middleware/validate";
import { createOkrSchema, updateKeyResultSchema } from "../../schemas";
import { AppEnv } from "../../types/env";

const okrsRoutes = new Hono<AppEnv>();

okrsRoutes.use("*", authMiddleware);
okrsRoutes.use("*", tenancyMiddleware);

okrsRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const objectives = await prisma.objectives.findMany({
      where: { tenant_id: tenantId },
      include: {
        key_results: true,
      },
      orderBy: { target_date: "asc" },
    });

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

    return c.json(data);
  } catch (err) {
    console.error("Error fetching OKRs:", err);
    return c.json({ error: "Failed to fetch OKRs" }, 500);
  }
});

okrsRoutes.post("/", validateBody(createOkrSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const body = c.get("validatedBody");

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

    return c.json(objective, 201);
  } catch (err) {
    console.error("Error creating OKR:", err);
    return c.json({ error: "Failed to create OKR" }, 500);
  }
});

okrsRoutes.put(
  "/:objectiveId/kr/:krId",
  validateBody(updateKeyResultSchema),
  async (c) => {
    const tenantId = c.get("tenantId");
    const krId = c.req.param("krId");
    const body = c.get("validatedBody");

    try {
      const updated = await prisma.key_results.updateMany({
        where: { id: krId, tenant_id: tenantId },
        data: {
          current_val: body.current_val,
          updated_at: new Date(),
        },
      });

      return c.json({ success: true, updated: updated.count });
    } catch (err) {
      console.error("Error updating key result:", err);
      return c.json({ error: "Failed to update key result" }, 500);
    }
  },
);

export default okrsRoutes;
