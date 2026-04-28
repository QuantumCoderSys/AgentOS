import type { Manifest } from "../generation/schemas.js";

export function generateGenericRules(manifest: Manifest): string {
  return `# Agent Instructions

## Project: ${manifest.projectName}

## Files
${manifest.files.map((f) => `- ${f.path} — ${f.purpose}`).join("\n")}

## Target agents
${manifest.agentTargets.join(", ")}

## Guidance
- Read the Project Brain before implementing.
- Follow the implementation plan phase by phase.
- Validate work using the acceptance criteria.
- Log decisions in DECISIONS_LOG.md.
`;
}
