import { inngest } from "./queue";
import { PrismaClient, Prisma } from "@prisma/client";

export const calculateHealthScoreJob = inngest.createFunction(
  { id: "calculate-health-score" },
  { cron: "TZ=America/Sao_Paulo 0 0 * * *" }, // Diário meia-noite BRT
  async ({ step }) => {
    const prisma = new PrismaClient();

    // 1 - Buscar todos os Tenants
    let activeTenants: string[] = [];
    try {
      const tenantsResult = await prisma.$queryRaw<{ tenant_id: string }[]>`
        SELECT DISTINCT tenant_id FROM public.transactions
        UNION
        SELECT DISTINCT tenant_id FROM public.accounts
      `;
      activeTenants = tenantsResult.map(
        (t: { tenant_id: string }) => t.tenant_id,
      );
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    }

    if (activeTenants.length === 0) {
      activeTenants.push("00000000-0000-0000-0000-000000000000"); // Mock UUID
    }

    for (const tenantId of activeTenants) {
      await step.run(`process-health-score-for-${tenantId}`, async () => {
        const alerts: Prisma.JsonArray = [];

        // --- FINANCIAL SCORE ---
        let financialScore = 50;
        try {
          const txCount = await prisma.transactions.count({
            where: { tenant_id: tenantId },
          });
          financialScore = txCount > 10 ? 90 : txCount > 0 ? 60 : 30;

          if (financialScore <= 30) {
            alerts.push({
              type: "yellow",
              message:
                "Baixo histórico de transações mapeado. Registre suas métricas para um cálculo preciso.",
              component: "financial",
            });
          } else if (financialScore >= 90) {
            alerts.push({
              type: "green",
              message: "Fluxo de transações ativo e detectado com sucesso.",
              component: "financial",
            });
          }
        } catch (e) {
          console.error("Finance error", e);
        }

        // --- PRODUCT SCORE ---
        let productScore = 100;
        try {
          const vulns: any[] = await prisma.$queryRaw`
            SELECT severity, count(*) as count 
            FROM public.github_security_alerts 
            WHERE tenant_id = ${tenantId}::uuid AND state = 'open' 
            GROUP BY severity
          `;
          let criticalCount = 0;
          let openCount = 0;
          for (const v of vulns) {
            openCount += Number(v.count);
            if (v.severity === "critical" || v.severity === "high") {
              criticalCount += Number(v.count);
            }
          }
          if (criticalCount > 0) {
            productScore = Math.max(0, 100 - criticalCount * 20);
            alerts.push({
              type: "red",
              message: `Atenção: ${criticalCount} vulnerabilidades críticas/altas no código.`,
              component: "product",
            });
          } else if (openCount > 0) {
            productScore = Math.max(50, 100 - openCount * 5);
            alerts.push({
              type: "yellow",
              message: `Existem ${openCount} alertas de segurança em aberto.`,
              component: "product",
            });
          }
        } catch (e) {
          console.error("Product error", e);
        }

        // --- COMPLIANCE ---
        let complianceScore = 50;
        try {
          const swots: any[] =
            await prisma.$queryRaw`SELECT count(*) FROM public.swot_items WHERE tenant_id = ${tenantId}::uuid`;
          if (Number(swots[0]?.count) > 0) complianceScore += 25;

          const controls: any[] =
            await prisma.$queryRaw`SELECT count(*) FROM public.audit_framework_controls WHERE tenant_id = ${tenantId}::uuid AND compliance_status = 'compliant'`;
          if (Number(controls[0]?.count) > 0) complianceScore += 25;

          if (complianceScore < 75) {
            alerts.push({
              type: "yellow",
              message:
                "Compliance incompleto. Revise sua matriz SWOT e controles.",
              component: "compliance",
            });
          }
        } catch (e) {
          console.error("Compliance error", e);
        }

        const teamScore = 80; // Placeholder
        const commercialScore = 80; // Placeholder

        const total = Math.floor(
          financialScore * 0.3 +
            productScore * 0.25 +
            complianceScore * 0.1 +
            teamScore * 0.2 +
            commercialScore * 0.15,
        );

        if (tenantId !== "00000000-0000-0000-0000-000000000000") {
          try {
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
          } catch (createErr) {
            console.error("Failed to create health score:", createErr);
          }
        }
      });
    }

    await prisma.$disconnect();
    return { status: "completed", processed: activeTenants.length };
  },
);
