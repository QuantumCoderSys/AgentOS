import { describe, it, expect } from "vitest";
import { ProjectProfileSchema, ArtifactPlanSchema, ManifestSchema } from "../../src/generation/schemas.js";

describe("ProjectProfileSchema", () => {
  it("validates a correct profile", () => {
    const result = ProjectProfileSchema.safeParse({
      projectName: "test-app",
      projectKind: "cli-tool",
      targetUsers: ["developers"],
      problem: "setup is hard",
      proposedSolution: "generate docs",
      platforms: ["node"],
      knownStack: ["typescript"],
      constraints: [],
      nonGoals: [],
      risks: [],
      unknowns: [],
      confidence: 0.8,
      followUpQuestions: [],
    });
    expect(result.success).toBe(true);
  });

  it("fails when required fields are missing", () => {
    const result = ProjectProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("ArtifactPlanSchema", () => {
  it("validates a correct plan", () => {
    const result = ArtifactPlanSchema.safeParse({
      files: [
        {
          path: "docs/agentos/PROJECT_BRIEF.md",
          purpose: "define project",
          sections: ["Summary"],
          priority: "required",
          targetAgents: ["codex"],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("fails on invalid priority", () => {
    const result = ArtifactPlanSchema.safeParse({
      files: [
        {
          path: "test.md",
          purpose: "test",
          sections: [],
          priority: "urgent",
          targetAgents: ["codex"],
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("ManifestSchema", () => {
  it("validates a correct manifest", () => {
    const result = ManifestSchema.safeParse({
      schemaVersion: "1.0",
      generatedAt: new Date().toISOString(),
      projectName: "test",
      files: [],
      agentTargets: ["codex"],
      provider: "openai",
      model: "gpt-4.1",
    });
    expect(result.success).toBe(true);
  });
});
