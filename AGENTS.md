# Agent Instructions: AgentOS

## Repository expectations
- This is the open-source AgentOS CLI tool.
- Read the PRD before making architectural changes.
- All durable decisions are logged in docs/agentos/DECISIONS_LOG.md.

## Read order
1. `agentos_skill_prd.md`
2. `README.md`
3. `src/cli.ts`
4. `src/generation/pipeline.ts`
5. `src/provider/types.ts`

## Project constraints
- TypeScript/Node.js 20+
- OpenAI SDK for AI generation
- No static markdown templates for generated project docs
- Use structured schemas and AI generation
- Include mock provider so tests run without OpenAI
- Use Zod for runtime schema validation
- Use Commander.js for CLI routing

## Coding standards
- Write tests alongside implementation.
- Prefer explicit over implicit.
- Keep functions small and focused.

## Dependency rules
- Only add dependencies if justified.
- Prefer well-maintained packages with clear licenses.

## Testing rules
- Every new feature needs at least one test.
- Run `npm run build && npm test` before finishing.

## Documentation rules
- Update DECISIONS_LOG.md for durable decisions.
- Update README.md for user-facing changes.

## Prohibited actions
- Do not add static markdown templates for generated docs.
- Do not write secrets to any file.
- Do not hardcode AI models without config override.

## Human approval triggers
- Scope changes
- New dependencies
- Security or legal concerns
- Breaking changes to CLI interface
