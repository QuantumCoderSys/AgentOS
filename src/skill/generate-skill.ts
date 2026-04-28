import type { ProjectProfile, ArtifactPlan } from "../generation/schemas.js";

export function generateSkill(
  profile: ProjectProfile,
  artifactPlan: ArtifactPlan,
  docsDir: string,
  skillName: string = "project-context"
): string {
  const references = artifactPlan.files
    .filter((f) => f.priority === "required")
    .map((f) => `- \`${f.path}\``)
    .join("\n");

  return `---
name: ${skillName}
description: Use before implementing features, modifying architecture, or making product decisions in this repository. Loads the generated AgentOS project brain, requirements, architecture, implementation plan, constraints, and validation checklist.
license: MIT
compatibility: Skills-compatible coding agents. Optimized for Codex; also useful for agents that read SKILL.md files.
---

# Project Context Skill: ${profile.projectName}

## Instructions

1. Read \`${docsDir}/PROJECT_BRIEF.md\`.
2. Read \`${docsDir}/PRODUCT_REQUIREMENTS.md\`.
3. Read \`${docsDir}/ARCHITECTURE.md\`.
4. Read \`${docsDir}/IMPLEMENTATION_PLAN.md\`.
5. Read \`${docsDir}/ACCEPTANCE_CRITERIA.md\`.
6. Summarize relevant constraints before coding.
7. Implement only one task or phase at a time.
8. Validate using listed commands.
9. Update \`DECISIONS_LOG.md\` when making durable decisions.

## Reference files
${references}

## Constraints summary
${profile.constraints.map((c) => `- ${c}`).join("\n") || "- None documented"}

## Validation checklist
- [ ] Read all required docs before starting
- [ ] Confirm the current phase from IMPLEMENTATION_PLAN.md
- [ ] Run build/test after changes
- [ ] Update DECISIONS_LOG.md for durable decisions
`;
}

export function generateSkillReferences(
  profile: ProjectProfile,
  artifactPlan: ArtifactPlan,
  docsDir: string
): Record<string, string> {
  const requiredFiles = artifactPlan.files
    .filter((file) => file.priority === "required")
    .map((file) => `- \`${file.path}\`: ${file.purpose}`)
    .join("\n");

  return {
    "references/project-summary.md": `# Project Summary

Project: ${profile.projectName}

Kind: ${profile.projectKind || "unknown"}

${profile.proposedSolution || "No proposed solution was recorded."}

## Target users
${profile.targetUsers?.map((user) => `- ${user}`).join("\n") || "- Not documented"}

## Constraints
${profile.constraints?.map((constraint) => `- ${constraint}`).join("\n") || "- None documented"}

## Non-goals
${profile.nonGoals?.map((nonGoal) => `- ${nonGoal}`).join("\n") || "- None documented"}
`,
    "references/implementation-plan.md": `# Implementation Plan Reference

Read \`${docsDir}/IMPLEMENTATION_PLAN.md\` before changing code.

## Required project brain files
${requiredFiles}
`,
    "references/validation-checklist.md": `# Validation Checklist

- Read \`${docsDir}/PROJECT_BRIEF.md\`.
- Read \`${docsDir}/PRODUCT_REQUIREMENTS.md\`.
- Read \`${docsDir}/ARCHITECTURE.md\`.
- Confirm the current phase in \`${docsDir}/IMPLEMENTATION_PLAN.md\`.
- Run the project build and test commands before finishing.
- Update \`${docsDir}/DECISIONS_LOG.md\` for durable decisions.
- Do not write secrets to any file.
`,
  };
}
