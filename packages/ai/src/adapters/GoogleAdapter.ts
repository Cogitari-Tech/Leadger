import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { IAIService, AIParams, AIResponse } from "../ports/IAIService";

export class GoogleAdapter implements IAIService {
  private client: GoogleGenerativeAI;

  private modelMapping: Record<AIParams["model"], string> = {
    fast: "gemini-2.5-flash",
    balanced: "gemini-2.5-pro",
    advanced: "gemini-2.5-pro",
  };

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async analyze(params: AIParams): Promise<AIResponse> {
    const modelOptions = {
      model: this.modelMapping[params.model],
      systemInstruction: params.systemPrompt,
    };

    const model: GenerativeModel = this.client.getGenerativeModel(modelOptions);

    const contextStr = params.context
      ? `CONTEXT:\n${JSON.stringify(params.context, null, 2)}\n\n`
      : "";
    const finalPrompt = `${contextStr}INSTRUCTION:\n${params.userPrompt}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: {
        maxOutputTokens: params.maxTokens || 4096,
        temperature: params.temperature ?? 0,
      },
    });

    const responseText = result.response.text();

    return {
      text: responseText,
      tokensUsed: {
        input: result.response.usageMetadata?.promptTokenCount || 0,
        output: result.response.usageMetadata?.candidatesTokenCount || 0,
      },
      provider: "google",
    };
  }
}
