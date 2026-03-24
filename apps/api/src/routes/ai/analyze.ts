import { Hono } from "hono";
import { AnthropicAdapter, GoogleAdapter, IAIService } from "@leadgers/ai";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const analyzeRoutes = new Hono<AppEnv>();

analyzeRoutes.use("*", authMiddleware);
analyzeRoutes.use("*", tenancyMiddleware);

analyzeRoutes.post("/", async (c) => {
  const googleKey = process.env.GOOGLE_AI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!googleKey && !anthropicKey) {
    return c.json(
      { error: "Nenhuma chave de API de IA configurada (Google ou Anthropic)" },
      500,
    );
  }

  // Use Google as default, fallback to Anthropic if explicitly available
  const aiService: IAIService = googleKey
    ? new GoogleAdapter(googleKey)
    : new AnthropicAdapter(anthropicKey!);

  const body = await c.req.json().catch(() => ({}));

  if (!body.userPrompt) {
    return c.json({ error: "userPrompt is required" }, 400);
  }

  // TODO: Implementar dedução de AI credits baseada no tenantId e modelo escolhido

  try {
    const response = await aiService.analyze({
      model: body.model || "fast",
      systemPrompt:
        body.systemPrompt ||
        "Você é um assistente financeiro AI expert da Leadgers.",
      userPrompt: body.userPrompt,
      context: body.context,
      maxTokens: body.maxTokens,
    });

    return c.json(response);
  } catch (error: any) {
    console.error("AI Analyze Error:", error);
    return c.json({ error: error.message || "AI processing failed" }, 500);
  }
});

export default analyzeRoutes;
