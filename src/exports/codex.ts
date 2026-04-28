import type { ProjectProfile, ArtifactPlan } from "../generation/schemas.js";

export function generateAgentsMd(
  profile: ProjectProfile,
  _artifactPlan: ArtifactPlan,
  docsDir: string
): string {

  return `# Agent Instructions: ${profile.projectName}

## Repository expectations
- This project uses AgentOS-generated context. Read the Project Brain before coding.
- All durable decisions are logged in \`${docsDir}/DECISIONS_LOG.md\`.

## Read order
1. \`${docsDir}/PROJECT_BRIEF.md\`
2. \`${docsDir}/PRODUCT_REQUIREMENTS.md\`
3. \`${docsDir}/ARCHITECTURE.md\`
4. \`${docsDir}/IMPLEMENTATION_PLAN.md\`
5. \`${docsDir}/ACCEPTANCE_CRITERIA.md\`
6. \`${docsDir}/AGENT_WORKFLOW.md\`

## Project constraints
${profile.constraints.map((c) => `- ${c}`).join("\n") || "- None documented"}

## Coding standards
- Write tests alongside implementation.
- Prefer explicit over implicit.
- Keep functions small and focused.

## Dependency rules
- Only add dependencies if justified in ARCHITECTURE.md or after user approval.
- Prefer well-maintained packages with clear licenses.

## Testing rules
- Every new feature needs at least one test.
- Run the validation command after each phase.

## Documentation rules
- Update DECISIONS_LOG.md for durable decisions.
- Update relevant docs when changing architecture or requirements.

## Prohibited actions
- Do not ignore constraints listed above.
- Do not add unapproved infrastructure (databases, queues, etc.).
- Do not write secrets to any file.

## Human approval triggers
- Scope changes
- New dependencies
- Security or legal concerns
- Breaking changes to public APIs
`;
}
