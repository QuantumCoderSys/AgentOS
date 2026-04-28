# Contributing to AgentOS

Thank you for your interest in contributing!

## Development setup

```bash
git clone https://github.com/agentos/agentos.git
cd agentos
npm install
npm run build
npm test
```

## Project structure

- `src/cli.ts` — CLI entry point
- `src/commands/` — CLI commands
- `src/provider/` — AI provider abstraction
- `src/generation/` — AI generation pipeline
- `src/writers/` — File writing utilities
- `src/validators/` — Validation logic
- `src/exports/` — Agent-specific exports
- `src/skill/` — Skill generation and validation
- `src/repo-inspector/` — Repository inspection
- `tests/` — Unit and integration tests

## Adding a provider

1. Implement the `AIProvider` interface in `src/provider/`
2. Add provider config handling in `src/utils/config.ts`
3. Add tests in `tests/unit/`

## Pull request process

1. Open an issue first for significant changes
2. Follow the existing code style
3. Add tests for new functionality
4. Ensure `npm run build && npm test` passes
5. Update README.md if needed

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
