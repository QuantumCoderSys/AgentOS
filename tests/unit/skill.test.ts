import { describe, expect, it } from "vitest";
import { generateSkill, generateSkillReferences } from "../../src/skill/generate-skill.js";

const profile = {
  projectName: "sample-project",
  projectKind: "cli-tool",
  targetUsers: ["developers"],
  problem: "setup is repetitive",
  proposedSolution: "generate project context",
  platforms: ["node"],
  knownStack: ["typescript"],
  constraints: ["no static templates"],
  nonGoals: ["full app scaffolding"],
  risks: [],
  unknowns: [],
  confidence: 0.9,
  followUpQuestions: [],
};

const artifactPlan = {
  files: [
    {
      path: "docs/agentos/PROJECT_BRIEF.md",
      purpose: "Define the project",
      sections: ["Summary"],
      priority: "required" as const,
      targetAgents: ["codex" as const],
    },
  ],
};

describe("generateSkill", () => {
  it("uses the requested skill name", () => {
    const skill = generateSkill(profile, artifactPlan, "docs/agentos", "custom-context");
    expect(skill).toContain("name: custom-context");
  });
});

describe("generateSkillReferences", () => {
  it("creates the expected reference files", () => {
    const references = generateSkillReferences(profile, artifactPlan, "docs/agentos");
    expect(Object.keys(references)).toEqual([
      "references/project-summary.md",
      "references/implementation-plan.md",
      "references/validation-checklist.md",
    ]);
    expect(references["references/project-summary.md"]).toContain("sample-project");
  });
});
