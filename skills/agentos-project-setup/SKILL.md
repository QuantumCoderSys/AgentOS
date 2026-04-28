---
name: agentos-project-setup
description: Use when setting up a new software project, creating project context, generating a PRD, defining agent instructions, bootstrapping an AI-ready repo, or preparing Codex/Cursor to build from scratch.
license: MIT
compatibility: Requires Node.js 20+, npm or pnpm, internet access, and OPENAI_API_KEY for AI generation.
---

# AgentOS Project Setup Skill

## When to use

- Starting a new project and want AI-ready documentation
- Preparing a repo for Codex, Cursor, or other coding agents
- Generating a PRD, architecture doc, or implementation plan
- Creating agent rules and constraints for consistent behavior

## How to use

1. Ensure `OPENAI_API_KEY` is set in the environment.
2. Run `agentos init <directory>` to create a Project Brain.
3. Answer the brief interview questions.
4. Review the generated files preview.
5. Confirm or use `--yes` to write files.
6. Use `agentos doctor` to validate outputs.

## Commands reference

- `agentos init [dir]` — Create Project Brain
- `agentos brief --from idea.txt` — Generate from text
- `agentos refine "change description"` — Update docs
- `agentos export --target cursor` — Export agent files
- `agentos skill pack` — Package as skill
- `agentos doctor` — Validate outputs
- `agentos provider test` — Check AI connectivity

## Output files

- `docs/agentos/PROJECT_BRIEF.md`
- `docs/agentos/PRODUCT_REQUIREMENTS.md`
- `docs/agentos/ARCHITECTURE.md`
- `docs/agentos/IMPLEMENTATION_PLAN.md`
- `docs/agentos/AGENT_WORKFLOW.md`
- `docs/agentos/ACCEPTANCE_CRITERIA.md`
- `AGENTS.md`
- `.agents/skills/project-context/SKILL.md`
- `.cursor/rules/project-context.mdc` (if Cursor target enabled)

## Troubleshooting

- Missing API key: set `OPENAI_API_KEY`
- Rate limits: retry later or use mock provider for tests
- Empty docs: check model availability and API billing
