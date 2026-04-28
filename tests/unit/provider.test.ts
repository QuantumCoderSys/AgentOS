import { describe, it, expect } from "vitest";
import { MockProvider } from "../../src/provider/mock-provider.js";
import { OpenAIProvider } from "../../src/provider/openai-provider.js";

describe("MockProvider", () => {
  it("generates structured project profile", async () => {
    const provider = new MockProvider();
    const result = await provider.generateStructured({
      systemPrompt: "normalize intake",
      userPrompt: "test idea",
      schema: {
        type: "object",
        properties: {
          projectName: { type: "string" },
          projectKind: { type: "string" },
          targetUsers: { type: "array", items: { type: "string" } },
          problem: { type: "string" },
          proposedSolution: { type: "string" },
          platforms: { type: "array", items: { type: "string" } },
          knownStack: { type: "array", items: { type: "string" } },
          constraints: { type: "array", items: { type: "string" } },
          nonGoals: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          unknowns: { type: "array", items: { type: "string" } },
          confidence: { type: "number" },
          followUpQuestions: { type: "array", items: { type: "string" } },
        },
        required: ["projectName", "projectKind", "targetUsers", "problem", "proposedSolution", "platforms", "knownStack", "constraints", "nonGoals", "risks", "unknowns", "confidence", "followUpQuestions"],
        additionalProperties: false,
      },
    });
    expect(result.projectName).toBeDefined();
    expect(result.projectKind).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("generates artifact plan", async () => {
    const provider = new MockProvider();
    const result = await provider.generateStructured({
      systemPrompt: "artifact plan",
      userPrompt: "test",
      schema: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                purpose: { type: "string" },
                sections: { type: "array", items: { type: "string" } },
                priority: { type: "string" },
                targetAgents: { type: "array", items: { type: "string" } },
              },
              required: ["path", "purpose", "sections", "priority", "targetAgents"],
            },
          },
        },
        required: ["files"],
      },
    });
    expect(result.files).toBeInstanceOf(Array);
    expect(result.files.length).toBeGreaterThan(0);
  });

  it("testConnection returns true", async () => {
    const provider = new MockProvider();
    expect(await provider.testConnection()).toBe(true);
  });
});

describe("OpenAIProvider", () => {
  it("throws when API key is missing", () => {
    const original = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    expect(() => new OpenAIProvider()).toThrow("Missing API key");
    if (original) process.env.OPENAI_API_KEY = original;
  });
});
