import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { PrismaFinanceRepository } from "../../adapters/PrismaFinanceRepository";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const burnRateRoutes = new Hono<AppEnv>();

burnRateRoutes.use("*", authMiddleware);
burnRateRoutes.use("*", tenancyMiddleware);

burnRateRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const prisma = new PrismaClient();
  const repo = new PrismaFinanceRepository(prisma, tenantId);

  const months = Number(c.req.query("months")) || 6;

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - months, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const incomeStatement = await repo.getIncomeStatement(start, end);

  const grossBurn = incomeStatement.expenses;
  const netBurn = incomeStatement.expenses - incomeStatement.revenue;

  const breakdown = Object.entries(
    incomeStatement.details.expensesByCategory || {},
  ).map(([category, amount]) => ({
    category,
    amount,
  }));

  // Trend data requires grouping by month, we'll mock for now
  const trend = [];
  for (let i = months; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    trend.push({
      month: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      gross: grossBurn / (months + 1), // Average for mock
      net: netBurn / (months + 1),
    });
  }

  await prisma.$disconnect();

  return c.json({
    grossBurn,
    netBurn,
    breakdown,
    trend,
    momDelta: 0.05, // 5% aumento (mock)
  });
});

export default burnRateRoutes;
