import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { AnthropicAdapter, GoogleAdapter, IAIService } from "@leadgers/ai";
import { PrismaFinanceRepository } from "../../adapters/PrismaFinanceRepository";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const weeklyDigestRoutes = new Hono<AppEnv>();

weeklyDigestRoutes.use("*", authMiddleware);
weeklyDigestRoutes.use("*", tenancyMiddleware);

weeklyDigestRoutes.post("/", async (c) => {
  const googleKey = process.env.GOOGLE_AI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!googleKey && !anthropicKey) {
    return c.json(
      { error: "Nenhuma chave de API de IA configurada (Google ou Anthropic)" },
      500,
    );
  }

  const aiService: IAIService = googleKey
    ? new GoogleAdapter(googleKey)
    : new AnthropicAdapter(anthropicKey!);

  const tenantId = c.get("tenantId");
  const prisma = new PrismaClient();
  const repo = new PrismaFinanceRepository(prisma, tenantId);

  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 7,
  );

  try {
    const recentTransactions = await repo.getTransactionsByPeriod(start, today);
    const incomeStatement = await repo.getIncomeStatement(start, today);

    // Context summary for the AI
    const context = {
      period: `${start.toISOString().split("T")[0]} to ${today.toISOString().split("T")[0]}`,
      transactionsCount: recentTransactions.length,
      revenue: incomeStatement.revenue,
      expenses: incomeStatement.expenses,
      netIncome: incomeStatement.netIncome,
    };

    const systemPrompt = `Você é um CFO virtual analisando um resumo financeiro semanal de uma startup B2B SaaS. 
Produza um pequeno resumo (Weekly Digest) focado em insights acionáveis sobre os números providenciados.`;

    const userPrompt = `Gere o Weekly Digest baseando-se nestes dados:`;

    const response = await aiService.analyze({
      model: "balanced", // use balanced for reasoning
      systemPrompt,
      userPrompt,
      context,
      maxTokens: 1000,
    });

    await prisma.$disconnect();

    return c.json({ digest: response.text, metrics: context });
  } catch (error: any) {
    await prisma.$disconnect();
    return c.json({ error: error.message }, 500);
  }
});

export default weeklyDigestRoutes;
