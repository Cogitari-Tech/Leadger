import { inngest } from "../queue";
import { PrismaClient } from "@prisma/client";
import { GoogleAdapter, AnthropicAdapter, IAIService } from "@leadgers/ai";

const prisma = new PrismaClient();

export const generateDataRoomReportJob = inngest.createFunction(
  { id: "generate-data-room-report", name: "Generate Data Room Report" },
  { event: "investor.report/generate" },
  async ({ event, step }) => {
    const {
      documentId,
      tenantId,
      type,
      model = "fast",
      byokKey,
      byokProvider,
    } = event.data;

    // 1. Validar e coletar dados do tenant
    const tenantData = await step.run("fetch-tenant-data", async () => {
      console.log(
        `Coletando dados financeiros e estratégicos para Tenant: ${tenantId}`,
      );

      const [milestones, healthScores, mrr] = await Promise.all([
        prisma.milestones.findMany({
          where: { tenant_id: tenantId },
          orderBy: { target_date: "desc" },
          take: 10,
        }),
        prisma.health_scores.findFirst({
          where: { tenant_id: tenantId },
          orderBy: { date: "desc" },
        }),
        prisma.mrr_snapshots.findFirst({
          where: { tenant_id: tenantId },
          orderBy: { month_date: "desc" },
        }),
      ]);

      return { milestones, healthScores, mrr };
    });

    // 2. Gerar relatório com IA
    const aiReport = await step.run("generate-ai-report", async () => {
      console.log(`Gerando report AI para tipo ${type}...`);

      let aiService: IAIService;
      let usedModelStr = "";

      // BYOK support ou Env fallback
      if (byokKey && byokProvider === "anthropic") {
        aiService = new AnthropicAdapter(byokKey);
        usedModelStr = "anthropic-byok";
      } else if (byokKey && byokProvider === "google") {
        aiService = new GoogleAdapter(byokKey);
        usedModelStr = "google-byok";
      } else {
        // Fallback hibrido para envs globais
        const googleKey = process.env.GOOGLE_AI_API_KEY;
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        if (googleKey && model === "fast") {
          aiService = new GoogleAdapter(googleKey);
          usedModelStr = "google-gemini";
        } else if (anthropicKey) {
          aiService = new AnthropicAdapter(anthropicKey);
          usedModelStr = "anthropic-claude";
        } else if (googleKey) {
          aiService = new GoogleAdapter(googleKey);
          usedModelStr = "google-gemini-fallback";
        } else {
          throw new Error(
            "Nenhuma chave de API configurada no sistema ou bypass",
          );
        }
      }

      const systemPrompt = `Você é um CFO virtual expert em Investor Relations de Startups B2B SaaS.
      Sua tarefa é redigir um "Investor Update" profissional e persuasivo em formato Markdown.
      Considere o período atual e as seguintes informações da empresa:
      - MRR Atual: ${tenantData.mrr?.total_mrr || 0}
      - Churn MRR: ${tenantData.mrr?.churn_mrr || 0}
      - Health Score Global: ${tenantData.healthScores?.total_score || "N/A"}
      - Histórico de Milestones Recentes: ${JSON.stringify(tenantData.milestones.map((m: any) => m.title))}
      
      Regras:
      1. Comece com um resumo executivo direto ao ponto.
      2. Destaque conquistas e riscos de forma transparente.
      3. Seja formatado lindamente em Markdown (h2, h3, bullet points).
      4. O documento deve ter o tom profissional de Y Combinator startups.`;

      const userPrompt = `Escreva o Investor Update do mês atual focado em: ${type}. Destaque as entregas de milestones.`;

      const response = await aiService.analyze({
        model: model as "fast" | "balanced" | "advanced",
        systemPrompt,
        userPrompt,
        maxTokens: 1500,
      });

      return { markdown: response.text, usedModelStr };
    });

    // 3. Persistir no banco
    await step.run("save-report", async () => {
      console.log(`Salvando no banco de dados o report do tipo ${type}...`);
      await prisma.investor_updates.create({
        data: {
          id: documentId, // using documentId generated from client as PK
          tenant_id: tenantId,
          title: `Investor Update - ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
          content_md: aiReport.markdown,
          period: new Date().toISOString().slice(0, 7), // "YYYY-MM"
          generated_by_ai: true,
          ai_model_used: aiReport.usedModelStr,
          status: "draft",
        },
      });
    });

    // 4. Notificar usuários
    await step.run("notify-users", async () => {
      console.log(`Notificando investidores sobre o novo update formatado...`);
      // Implementação de email/in-app bounds aqui
    });

    return { success: true, ai_model: aiReport.usedModelStr };
  },
);
