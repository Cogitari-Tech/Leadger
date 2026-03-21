import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const unitEconomicsRoutes = new Hono<AppEnv>();

unitEconomicsRoutes.use("*", authMiddleware);
unitEconomicsRoutes.use("*", tenancyMiddleware);

unitEconomicsRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  // TODO: Buscar o snapshot mais recente da tabela unit_economics_snapshots
  // const latest = await prisma.unit_economics_snapshots.findFirst({ where: { tenant_id: tenantId }, orderBy: { date: 'desc' } });

  // Valores mockados até termos o schema Prisma atualizado
  const cac = 1500;
  const ltv = 6000;
  const arpu = 500;
  const churnRate = 0.083; // 8.3%
  const ltvCacRatio = ltv / cac;
  const paybackMonths = cac / arpu;

  const alerts = [];
  if (ltvCacRatio >= 3)
    alerts.push({ type: "green", message: "LTV/CAC excelente (>= 3x)" });
  else if (ltvCacRatio >= 1)
    alerts.push({ type: "yellow", message: "LTV/CAC em risco (< 3x)" });
  else alerts.push({ type: "red", message: "LTV/CAC crítico (< 1x)" });

  return c.json({
    cac,
    ltv,
    arpu,
    churnRate,
    ltvCacRatio,
    paybackMonths,
    alerts,
  });
});

export default unitEconomicsRoutes;
