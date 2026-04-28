export interface TextGenerationRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export interface StructuredGenerationRequest {
  systemPrompt: string;
  userPrompt: string;
  schema: object;
  temperature?: number;
}

export interface AIProvider {
  name: string;
  generateText(request: TextGenerationRequest): Promise<string>;
  generateStructured<T>(request: StructuredGenerationRequest): Promise<T>;
  testConnection(): Promise<boolean>;
}
