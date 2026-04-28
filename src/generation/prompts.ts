export const SYSTEM_PROMPT_BASE = `You are generating project setup documentation for AI coding agents.
Your output must be specific to the user's project.
Do not generate generic startup boilerplate.
Separate confirmed constraints from assumptions.
Every file must help a future coding agent make better implementation decisions.
Prefer clear checklists, acceptance criteria, and explicit non-goals.
Never pretend uncertain details are confirmed.
Never create fake package names.
Never assume a web app if the project is not a web app.
Never tell agents to "use best practices" without defining them.
Never include secret values or placeholder API keys beyond safe examples.`;

export function intakeNormalizationPrompt(
  rawIdea: string,
  answers: Record<string, string>,
  repoSummary?: string
): { system: string; user: string } {
  return {
    system: `${SYSTEM_PROMPT_BASE}
Normalize the user's rough project idea into a structured project profile.
Respond with valid JSON matching the schema exactly.`,
    user: `Raw idea: ${rawIdea}
${Object.entries(answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")}
${repoSummary ? `\nExisting repo summary:\n${repoSummary}` : ""}

Normalize into:
- projectName: kebab-case name
- projectKind: one of saas, cli-tool, mobile-app, browser-extension, wordpress-plugin, game, data-pipeline, automation-script, mcp-server, ai-agent, desktop-app, internal-tool, research-repo, library, or other
- targetUsers: array of user descriptions
- problem: the problem being solved
- proposedSolution: what the product does
- platforms: array of target platforms
- knownStack: array of known technologies
- constraints: array of explicit constraints
- nonGoals: array of explicit non-goals
- risks: array of known risks
- unknowns: array of open questions
- confidence: 0-1 estimate of clarity
- followUpQuestions: array of questions to ask if confidence < 0.8`,
  };
}

export function artifactPlanPrompt(profile: string): { system: string; user: string } {
  return {
    system: `${SYSTEM_PROMPT_BASE}
Create an artifact plan that lists all documentation files needed for this project.
Respond with valid JSON matching the schema exactly.`,
    user: `Project profile:\n${profile}\n
Create an artifact plan with files array. Each file must have:
- path: relative path under docs/agentos/
- purpose: one-sentence description
- sections: array of required sections
- priority: required | recommended | optional
- targetAgents: array of codex, cursor, generic`,
  };
}

export function documentGenerationPrompt(
  profile: string,
  artifactPlan: string,
  filePath: string,
  purpose: string,
  sections: string[]
): { system: string; user: string } {
  return {
    system: `${SYSTEM_PROMPT_BASE}
Generate a single markdown document. Output ONLY the markdown content. No JSON wrapper. No markdown code fences around the whole output.`,
    user: `Project profile:\n${profile}\n
Artifact plan:\n${artifactPlan}\n
Generate ONLY the content for: ${filePath}
Purpose: ${purpose}
Required sections: ${sections.join(", ")}

Write concise, practical, project-specific markdown. Include checklists and criteria where appropriate.`,
  };
}

export function reviewPrompt(
  profile: string,
  documents: string
): { system: string; user: string } {
  return {
    system: `${SYSTEM_PROMPT_BASE}
Review generated documents for quality and consistency.
Respond with valid JSON with fixes array and notes array.`,
    user: `Project profile:\n${profile}\n
Generated documents:\n${documents}

Check for:
- contradictions
- missing constraints
- vague requirements
- overbuilt scope
- unsupported assumptions
- missing validation steps
- inconsistent terminology

Return fixes as {file, issue, suggestion} objects and notes as strings.`,
  };
}
