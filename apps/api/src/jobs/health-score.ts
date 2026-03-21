import { inngest } from "./queue";
import { PrismaClient, Prisma } from "@prisma/client";

export const calculateHealthScoreJob = inngest.createFunction(
  { id: "calculate-health-score" },
  { cron: "TZ=America/Sao_Paulo 0 0 * * *" }, // Diário meia-noite BRT
  async ({ step }) => {
    const prisma = new PrismaClient();

    // 1 - Buscar todos os Tenants
    // Para simplificar, estamos rodando em mock de demo (pois as entidades de Tenant estão no Supabase Auth)
    // No ambiente ideal, consumiremos a tabela "tenants" do Prisma
    const activeTenants = ["tenant-1234"];

    for (const tenantId of activeTenants) {
      await step.run(`process-health-score-for-${tenantId}`, async () => {
        // Mock lógicas de pontuação (que viriam dos repos)
        const financialScore = 80;
        const productScore = 75;
        const complianceScore = 50;
        const teamScore = 100;
        const commercialScore = 80;

        const total = Math.floor(
          financialScore * 0.3 +
            productScore * 0.25 +
            complianceScore * 0.1 +
            teamScore * 0.2 +
            commercialScore * 0.15,
        );

        const alerts: Prisma.JsonArray = [];
        if (complianceScore < 60) {
          alerts.push({
            type: "yellow",
            message:
              "Risco identificados nos Itens da Matriz SWOT/FOFA. Atualize a matriz.",
            component: "compliance",
          });
        }
        if (financialScore > 75) {
          alerts.push({
            type: "green",
            message: "Seu Runway e seu Burn Rate estão sustentáveis!",
            component: "financial",
          });
        }

        await prisma.health_scores.create({
          data: {
            tenant_id: tenantId,
            total_score: total,
            financial: financialScore,
            product: productScore,
            compliance: complianceScore,
            team: teamScore,
            commercial: commercialScore,
            alerts: alerts,
          },
        });
      });
    }

    await prisma.$disconnect();
    return { status: "completed", processed: activeTenants.length };
  },
);
