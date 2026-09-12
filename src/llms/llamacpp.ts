import { DEFAULT_SYSTEM_PROMPT, DEFAULT_SYSTEM_PROMPT_WITH_CONTEXT } from "../utils/prompt";
import type { LLMProvider } from "./index";
import { log } from "../utils/tui-events";

export class LlamaCppProvider implements LLMProvider {
  private host: string;
  private modelId: string;
  name = "Llama.cpp";
  private readonly availableModels = ["default"];

  constructor(modelId?: string) {
    // Get llama.cpp host from environment variable or use default
    // llama.cpp server runs on port 8000 by default
    this.host = process.env.LLAMACPP_HOST || "http://127.0.0.1:8000";
    this.modelId = modelId || this.availableModels[0];
  }

  async generateCode(prompt: string, temperature?: number, contextContent?: string): Promise<string> {
    try {
      log(`🤖 Generating code with llama.cpp using model: ${this.modelId} (temp: ${temperature ?? "default"})...`);

      const systemPrompt = contextContent ? DEFAULT_SYSTEM_PROMPT_WITH_CONTEXT : DEFAULT_SYSTEM_PROMPT;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...(contextContent ? [{ role: "user" as const, content: contextContent }] : []),
        { role: "user" as const, content: prompt },
      ];

      const response = await fetch(`${this.host}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "default",
          messages,
          temperature: temperature ?? 0.7,
          top_p: 0.95,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as any;
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("Error generating code with llama.cpp:", error);
      throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getModels(): string[] {
    return [...this.availableModels];
  }

  getModelIdentifier(): string {
    return this.modelId;
  }
}
