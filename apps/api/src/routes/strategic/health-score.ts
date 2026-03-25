import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const healthScoreRoutes = new Hono<AppEnv>();

healthScoreRoutes.use("*", authMiddleware);
healthScoreRoutes.use("*", tenancyMiddleware);

healthScoreRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const prisma = new PrismaClient();

  try {
    const latestScore = await prisma.health_scores.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });

    await prisma.$disconnect();

    if (!latestScore) {
      // Retorna vazio amigável caso seja o "Dia Zero" e o Cron ainda não tiver rodado
      return c.json({
        total_score: 0,
        financial: 0,
        product: 0,
        compliance: 0,
        team: 0,
        commercial: 0,
        alerts: [
          {
            type: "yellow",
            message: "Calculando pontuação inicial de saúde...",
            component: "system",
          },
        ],
      });
    }

    return c.json(latestScore);
  } catch (err: any) {
    await prisma.$disconnect();
    return c.json({ error: err.message }, 500);
  }
});

export default healthScoreRoutes;
