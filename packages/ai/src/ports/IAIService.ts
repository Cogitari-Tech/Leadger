export interface AIParams {
  model: "fast" | "balanced" | "advanced";
  systemPrompt: string;
  userPrompt: string;
  context?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  provider: "google" | "anthropic";
}

export interface IAIService {
  analyze(params: AIParams): Promise<AIResponse>;
}
