import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const healthScoreRoutes = new Hono<AppEnv>();

healthScoreRoutes.use("*", authMiddleware);
healthScoreRoutes.use("*", tenancyMiddleware);

healthScoreRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const latestScore = await prisma.health_scores.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });

    if (!latestScore) {
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
  } catch (err) {
    console.error("Error fetching health score:", err);
    return c.json({ error: "Failed to fetch health score" }, 500);
  }
});

export default healthScoreRoutes;
