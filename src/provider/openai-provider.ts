import OpenAI from "openai";
import type {
  AIProvider,
  TextGenerationRequest,
  StructuredGenerationRequest,
} from "./types.js";
import { MissingApiKeyError, ProviderError } from "../utils/errors.js";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(model?: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new MissingApiKeyError("openai");
    }
    this.client = new OpenAI({ apiKey });
    this.model = model || process.env.AGENTOS_MODEL || "gpt-4.1";
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: this.model,
        input: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        temperature: request.temperature ?? 0.5,
      });
      const text =
        typeof response.output_text === "string"
          ? response.output_text
          : "";
      if (!text) {
        throw new ProviderError("Empty response from OpenAI");
      }
      return text;
    } catch (err) {
      if (err instanceof MissingApiKeyError) throw err;
      if (err instanceof ProviderError) throw err;
      throw new ProviderError(
        `OpenAI text generation failed: ${(err as Error).message}`
      );
    }
  }

  async generateStructured<T>(
    request: StructuredGenerationRequest
  ): Promise<T> {
    try {
      const response = await this.client.responses.create({
        model: this.model,
        input: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        temperature: request.temperature ?? 0.2,
        text: {
          format: {
            type: "json_schema",
            name: "structured_output",
            schema: request.schema as Record<string, unknown>,
            strict: true,
          },
        },
      });
      const text =
        typeof response.output_text === "string"
          ? response.output_text
          : "";
      if (!text) {
        throw new ProviderError("Empty structured response from OpenAI");
      }
      return JSON.parse(text) as T;
    } catch (err) {
      if (err instanceof MissingApiKeyError) throw err;
      if (err instanceof ProviderError) throw err;
      throw new ProviderError(
        `OpenAI structured generation failed: ${(err as Error).message}`
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
