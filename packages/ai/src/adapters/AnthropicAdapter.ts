import Anthropic from "@anthropic-ai/sdk";
import { IAIService, AIParams, AIResponse } from "../ports/IAIService";

export class AnthropicAdapter implements IAIService {
  private client: Anthropic;

  private modelMapping: Record<AIParams["model"], string> = {
    fast: "claude-3-haiku-20240307",
    balanced: "claude-3-5-sonnet-20241022",
    advanced: "claude-3-opus-20240229",
  };

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyze(params: AIParams): Promise<AIResponse> {
    const contextStr = params.context
      ? `CONTEXT:\n${JSON.stringify(params.context, null, 2)}\n\n`
      : "";
    const finalUserPrompt = `${contextStr}INSTRUCTION:\n${params.userPrompt}`;

    const response = await this.client.messages.create({
      model: this.modelMapping[params.model],
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature ?? 0,
      system: params.systemPrompt,
      messages: [{ role: "user", content: finalUserPrompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");

    return {
      text: textContent?.type === "text" ? textContent.text : "",
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
      provider: "anthropic",
    };
  }
}
