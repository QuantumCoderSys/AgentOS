import type { ProjectProfile } from "../generation/schemas.js";

export function generateCursorRules(profile: ProjectProfile, docsDir: string): string {
  return `---
description: AgentOS project context for ${profile.projectName}
glob: **/*
---

# ${profile.projectName} — Project Context

## Project summary
${profile.proposedSolution}

## Read order
1. ${docsDir}/PROJECT_BRIEF.md
2. ${docsDir}/PRODUCT_REQUIREMENTS.md
3. ${docsDir}/ARCHITECTURE.md
4. ${docsDir}/IMPLEMENTATION_PLAN.md

## Coding constraints
${profile.constraints.map((c) => `- ${c}`).join("\n") || "- None documented"}

## Testing expectations
- Write tests alongside implementation.
- Run build and test commands before finishing.

## Dependency rules
- Do not add dependencies without justification.
- Prefer well-maintained packages.

## Forbidden actions
- Do not ignore project constraints.
- Do not write secrets to files.
- Do not overbuild beyond MVP scope.

## When to update docs
- After architecture changes
- After scope decisions
- After adding new constraints
`;
}
