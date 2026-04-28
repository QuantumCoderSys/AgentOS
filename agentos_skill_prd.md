# PRD: AgentOS Skill — AI-Powered Project Setup for Coding Agents

**Version:** 1.0  
**Status:** Implementation-ready PRD  
**Primary builder:** Codex / Cursor / Kimi K2.6 / any coding agent that can build a TypeScript CLI  
**Product type:** Open-source CLI + Agent Skill + Codex Plugin  
**Default AI provider:** OpenAI API via Responses API  
**Core rule:** No local markdown document templates for generated project docs. Use AI generation with structured schemas, validation, and deterministic file writing.

---

## 1. Executive Summary

AgentOS Skill is an open-source project setup system that helps AI coding agents start new projects properly.

Instead of generating a fixed web/app/API template, AgentOS turns a rough project idea into an **AI-ready project brain**: project brief, PRD, architecture plan, implementation roadmap, agent rules, acceptance criteria, risk register, security notes, and a project-specific Agent Skill. It should work for any project category: SaaS, CLI tool, mobile app, browser extension, WordPress plugin, game, data pipeline, automation script, MCP server, AI agent, desktop app, internal tool, research repo, or anything else.

The product has two surfaces:

1. **AgentOS CLI** — a TypeScript command-line tool that talks to the OpenAI API, interviews the user, generates structured project documentation, and writes agent-friendly files into the target repository.
2. **AgentOS Skill / Plugin** — a portable Agent Skill packaged for Codex and skills-compatible agents. The skill teaches an AI coding agent how to run AgentOS, generate project context, validate the outputs, and use the generated files before coding.

The goal is not to scaffold generic source code. The goal is to create the reusable context and workflow that agents usually lack before they start coding.

---

## 2. Research Basis and Design Decisions

The implementation should be grounded in these current ecosystem facts:

- OpenAI’s quickstart shows API keys being provided through `OPENAI_API_KEY`, and the OpenAI SDKs read API keys from the environment. AgentOS should use this pattern and never ask users to paste keys into generated files.
- The OpenAI JavaScript SDK is the official SDK for server-side JavaScript environments, and the Responses API is the right default API surface for text generation, file inputs, tools, streaming, and structured generation.
- OpenAI Structured Outputs can enforce schema-adherent model responses. AgentOS should use structured JSON schemas for planning, artifact manifests, and validation rather than relying on brittle freeform generations.
- OpenAI function/tool calling exists for connecting models to application functionality. AgentOS should not need tool calling for MVP, but the architecture should leave room for future deterministic tools such as repository inspection, docs lookup, and package validation.
- The open Agent Skills format defines a skill as a folder with `SKILL.md`, metadata, instructions, and optional `scripts/`, `references/`, and `assets/`. AgentOS should output a valid project-specific skill and also ship its own reusable AgentOS skill.
- Codex supports Agent Skills and Codex Plugins. Skills are reusable workflows; plugins are installable distribution bundles that can include skills, apps, and MCP server configuration. AgentOS should ship as both a local skill and a Codex plugin bundle.
- Codex reads `AGENTS.md` before work and supports layered project guidance. AgentOS should generate `AGENTS.md` for project-level agent instructions.
- Cursor supports persistent project/user/team rules and `AGENTS.md`; AgentOS should generate Cursor-compatible rules as an export target.

Reference URLs used while preparing this PRD:

- OpenAI Quickstart: https://developers.openai.com/api/docs/quickstart
- OpenAI Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI Function Calling: https://developers.openai.com/api/docs/guides/function-calling
- OpenAI Tools: https://developers.openai.com/api/docs/guides/tools
- Codex Agent Skills: https://developers.openai.com/codex/skills
- Codex Plugins: https://developers.openai.com/codex/plugins
- Codex Build Plugins: https://developers.openai.com/codex/plugins/build
- Codex AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- Agent Skills Specification: https://agentskills.io/specification
- Cursor Rules: https://cursor.com/docs/rules

---

## 3. Problem Statement

AI coding agents are powerful, but starting a new project with them is repetitive and error-prone. Users repeatedly explain:

- what they are building
- who it is for
- what stack to use
- what constraints matter
- what files to create
- what design style to follow
- what not to change
- what quality bar to meet
- what testing and validation should happen
- what decisions have already been made

When this context is missing, agents often:

- invent unnecessary architecture
- ignore constraints
- generate generic docs
- choose random dependencies
- overbuild the first version
- forget previous decisions
- create mismatched UI, file structure, or workflows
- require repeated manual prompting

AgentOS solves this by creating a **version-controlled project operating layer** before code is written.

---

## 4. Product Vision

AgentOS should become the open-source standard for preparing AI coding agents to work on any project from scratch.

The product should feel like:

> “Describe what you want to build. AgentOS asks the right questions, calls OpenAI, generates the project brain, packages it as an agent skill, and makes the repo ready for Codex, Cursor, Kimi, or any other AI coding agent.”

---

## 5. Target Users

### 5.1 Indie builders

People who build many projects and are tired of repeating the same setup instructions to agents.

### 5.2 Technical founders

People who know what they want but need a clean AI-ready PRD, architecture, and execution plan before coding.

### 5.3 Agencies and freelancers

People who start client projects frequently and want consistent setup, documentation, and agent instructions.

### 5.4 Open-source maintainers

People who want contributors and coding agents to understand project norms quickly.

### 5.5 Teams experimenting with agentic coding

Teams that want consistent agent behavior across Codex, Cursor, and other coding tools.

---

## 6. Goals

### Product goals

1. Convert rough project ideas into clear project documentation using OpenAI.
2. Generate agent-friendly markdown files that are specific to the project.
3. Package generated context as a project-specific Agent Skill.
4. Support Codex first, while remaining useful for Cursor and other agents.
5. Avoid fixed local markdown templates for generated project documents.
6. Make outputs deterministic enough to validate, diff, regenerate, and commit.
7. Keep API keys private and use bring-your-own-key configuration.
8. Make the repository open-source friendly, easy to install, and easy to contribute to.

### Engineering goals

1. Build a TypeScript CLI that runs with Node.js.
2. Use the official OpenAI JavaScript SDK.
3. Use structured JSON schemas for AI planning and artifact generation.
4. Write files only after showing a preview or receiving confirmation, unless `--yes` is passed.
5. Support dry-run mode.
6. Support existing-repo mode and new-project mode.
7. Include a validation command that checks generated docs and skills.
8. Include tests with mocked AI provider responses.

---

## 7. Non-Goals

AgentOS MVP should not:

1. Generate a full app codebase from scratch.
2. Become a SaaS product.
3. Store API keys in the repo.
4. Require local LLMs.
5. Use local markdown templates for generated project docs.
6. Support every AI provider at launch.
7. Guarantee the correctness of architectural decisions without user review.
8. Replace human approval for product, security, or legal decisions.
9. Upload the full repository to OpenAI by default without showing what will be sent.
10. Manage deployments, hosting accounts, or billing services.

---

## 8. Product Principles

1. **AI-generated, schema-controlled, not template-filled.**  
   The generated docs should come from the model, but the structure should be controlled by schemas and validators.

2. **Any project type.**  
   The system must not be centered only on websites, APIs, SaaS apps, or landing pages.

3. **Agent-first outputs.**  
   Every generated file should help an AI agent make better implementation decisions.

4. **Project-specific over generic.**  
   Avoid filler like “ensure best practices.” Instead, state exact project constraints, decisions, and validation steps.

5. **Version-controlled context.**  
   The output should be committed to Git and updated as the project evolves.

6. **Bring your own AI key.**  
   The open-source tool should not proxy or own user AI usage.

7. **Review before writing.**  
   Users should be able to inspect planned changes before AgentOS writes files.

8. **Portable skill format.**  
   The generated skill should follow the Agent Skills convention and work across compatible agents where possible.

---

## 9. Core Concept

AgentOS produces a **Project Brain**.

A Project Brain is a folder and file set containing:

- what the project is
- who it is for
- what the MVP is
- what is out of scope
- what technical decisions are known
- what the agent should do first
- what the agent must avoid
- how to validate work
- what risks exist
- what files should guide future implementation

The Project Brain should be generated into the target repository and should be readable by humans and agents.

---

## 10. User Experience

### 10.1 New project flow

Command:

```bash
npx agentos init my-project
```

Behavior:

1. Create the target directory if it does not exist.
2. Ask the user for a rough idea.
3. Ask a small number of project-shaping questions.
4. Call OpenAI to normalize the input into a structured project profile.
5. Generate an artifact plan.
6. Show a preview of files to be written.
7. Write the Project Brain and skill files.
8. Print next steps for Codex, Cursor, or generic agents.

Example prompt:

```txt
What are you building?
> A desktop app for Indian shop owners to create GST invoices offline.

Known constraints?
> Tauri, React, SQLite, INR, simple UI, offline-first.

Who will use it?
> Small shop owners, not technical users.

Which agent should this be optimized for?
> Codex
```

Expected output:

```txt
Generated Project Brain:
- docs/agentos/PROJECT_BRIEF.md
- docs/agentos/PRODUCT_REQUIREMENTS.md
- docs/agentos/ARCHITECTURE.md
- docs/agentos/IMPLEMENTATION_PLAN.md
- docs/agentos/ACCEPTANCE_CRITERIA.md
- docs/agentos/SECURITY_AND_PRIVACY.md
- docs/agentos/RISK_REGISTER.md
- AGENTS.md
- .agents/skills/project-context/SKILL.md
- .cursor/rules/project-context.mdc
- .agentos/config.json
- .agentos/manifest.json
```

### 10.2 Existing repository flow

Command:

```bash
agentos init --existing
```

Behavior:

1. Detect Git root.
2. Inspect safe files only:
   - `README.md`
   - `package.json`
   - `pyproject.toml`
   - `Cargo.toml`
   - `go.mod`
   - `composer.json`
   - selected files under `src/`, limited by size
3. Show the files that will be summarized or sent to OpenAI.
4. Ask for confirmation.
5. Generate a project context and missing agent docs.
6. Avoid overwriting existing files unless the user confirms.

### 10.3 Refinement flow

Command:

```bash
agentos refine
```

User says:

```txt
We decided to use Supabase instead of Firebase, and the MVP must include team invites.
```

Behavior:

1. Read `.agentos/manifest.json` and existing generated docs.
2. Ask OpenAI to produce a change plan.
3. Show a diff preview.
4. Update affected docs.
5. Append a decision to `docs/agentos/DECISIONS_LOG.md`.

### 10.4 Skill packaging flow

Command:

```bash
agentos skill pack
```

Behavior:

1. Generate or update `.agents/skills/project-context/SKILL.md`.
2. Validate the skill metadata.
3. Optionally create a Codex plugin package.
4. Print how to invoke it:

```txt
In Codex, ask:
Use $project-context to understand this project before implementing anything.
```

### 10.5 Doctor flow

Command:

```bash
agentos doctor
```

Checks:

- required files exist
- `SKILL.md` has valid frontmatter
- `AGENTS.md` is present
- `.agentos/manifest.json` is valid
- generated docs are not empty
- no obvious API keys were written
- recommended next action exists
- target-specific exports exist if requested

---

## 11. CLI Commands

### 11.1 `agentos init`

Create a Project Brain.

Options:

```bash
agentos init [directory]
agentos init --existing
agentos init --agent codex
agentos init --agent cursor
agentos init --agent generic
agentos init --model gpt-5.5
agentos init --yes
agentos init --dry-run
agentos init --no-repo-scan
agentos init --output docs/agentos
```

### 11.2 `agentos brief`

Generate docs from a single rough text input.

```bash
agentos brief --from idea.txt
agentos brief --stdin
agentos brief --interactive
```

### 11.3 `agentos refine`

Update generated docs from new constraints.

```bash
agentos refine "Change database from Firebase to Supabase"
agentos refine --from update.md
agentos refine --dry-run
```

### 11.4 `agentos export`

Generate target-specific agent files.

```bash
agentos export --target codex
agentos export --target cursor
agentos export --target generic
agentos export --all
```

### 11.5 `agentos skill pack`

Generate a project-specific Agent Skill and optional Codex plugin wrapper.

```bash
agentos skill pack
agentos skill pack --codex-plugin
agentos skill pack --name project-context
```

### 11.6 `agentos doctor`

Validate installation and outputs.

```bash
agentos doctor
agentos doctor --strict
```

### 11.7 `agentos config`

Manage configuration.

```bash
agentos config show
agentos config set provider openai
agentos config set model gpt-5.5
agentos config set outputDir docs/agentos
```

### 11.8 `agentos provider test`

Validate AI provider connectivity.

```bash
agentos provider test
```

---

## 12. Generated Files

### 12.1 Default Project Brain files

```txt
AGENTS.md
.agentos/
  config.json
  manifest.json
  run-history.jsonl
  redaction-report.json
  generated-by.md

docs/agentos/
  PROJECT_BRIEF.md
  PRODUCT_REQUIREMENTS.md
  ARCHITECTURE.md
  IMPLEMENTATION_PLAN.md
  AGENT_WORKFLOW.md
  ACCEPTANCE_CRITERIA.md
  TECH_DECISIONS.md
  DESIGN_DIRECTION.md
  SECURITY_AND_PRIVACY.md
  RISK_REGISTER.md
  DECISIONS_LOG.md
  GLOSSARY.md

.agents/skills/project-context/
  SKILL.md
  references/
    project-summary.md
    implementation-plan.md
    validation-checklist.md

.cursor/rules/
  project-context.mdc
```

### 12.2 `PROJECT_BRIEF.md`

Purpose:

- define the project in simple language
- explain the users
- define the outcome
- list constraints
- identify assumptions

Required sections:

- Summary
- Target users
- Problem
- Proposed solution
- MVP outcome
- Known constraints
- Explicit non-goals
- Open questions
- Agent guidance

### 12.3 `PRODUCT_REQUIREMENTS.md`

Purpose:

- convert rough idea into implementation-ready requirements

Required sections:

- Product overview
- Personas
- User stories
- Functional requirements
- Non-functional requirements
- MVP scope
- Out-of-scope items
- Acceptance criteria
- Edge cases
- Questions for human review

### 12.4 `ARCHITECTURE.md`

Purpose:

- give agents enough architecture context before coding

Required sections:

- Architecture summary
- Recommended stack
- Data model assumptions
- Main modules
- Integration points
- State management
- Error handling
- Security considerations
- File structure recommendation
- Architecture tradeoffs
- What not to overbuild

### 12.5 `IMPLEMENTATION_PLAN.md`

Purpose:

- sequence implementation into agent-friendly steps

Required sections:

- Phase 0: setup and verification
- Phase 1: core data model
- Phase 2: core user flow
- Phase 3: interface and UX
- Phase 4: testing and hardening
- Phase 5: release readiness
- Per-task acceptance criteria
- Suggested validation command after each phase

### 12.6 `AGENT_WORKFLOW.md`

Purpose:

- define how coding agents should work in the repo

Required sections:

- Files to read first
- How to plan
- How to implement
- How to validate
- How to update docs
- When to ask the user
- When not to ask and proceed with a safe default
- How to log decisions

### 12.7 `AGENTS.md`

Purpose:

- project-level agent instructions for Codex and other agents

Required sections:

- Repository expectations
- Read order
- Project constraints
- Coding standards
- Dependency rules
- Testing rules
- Documentation rules
- Prohibited actions
- Human approval triggers

### 12.8 Project-specific `SKILL.md`

Purpose:

- allow agents to activate project context as a skill

Path:

```txt
.agents/skills/project-context/SKILL.md
```

Required frontmatter:

```yaml
---
name: project-context
description: Use before implementing features, modifying architecture, or making product decisions in this repository. Loads the generated AgentOS project brain, requirements, architecture, implementation plan, constraints, and validation checklist.
license: MIT
compatibility: Skills-compatible coding agents. Optimized for Codex; also useful for agents that read SKILL.md files.
---
```

Required body behavior:

1. Read `docs/agentos/PROJECT_BRIEF.md`.
2. Read `docs/agentos/PRODUCT_REQUIREMENTS.md`.
3. Read `docs/agentos/ARCHITECTURE.md`.
4. Read `docs/agentos/IMPLEMENTATION_PLAN.md`.
5. Read `docs/agentos/ACCEPTANCE_CRITERIA.md`.
6. Summarize relevant constraints before coding.
7. Implement only one task or phase at a time.
8. Validate using listed commands.
9. Update `DECISIONS_LOG.md` when making durable decisions.

---

## 13. AgentOS Repository Structure

The open-source repo should be organized like this:

```txt
agentos/
  package.json
  tsconfig.json
  README.md
  LICENSE
  AGENTS.md
  CONTRIBUTING.md

  src/
    cli.ts
    commands/
      init.ts
      brief.ts
      refine.ts
      export.ts
      doctor.ts
      skill.ts
      config.ts
      provider-test.ts
    provider/
      types.ts
      openai-provider.ts
      mock-provider.ts
    generation/
      pipeline.ts
      prompts.ts
      schemas.ts
      artifact-plan.ts
      reviewer.ts
      markdown-renderer.ts
    interview/
      questions.ts
      normalize.ts
    repo-inspector/
      inspect.ts
      ignore.ts
      redact.ts
      summarize.ts
    writers/
      write-files.ts
      diff-preview.ts
      safe-path.ts
    skill/
      generate-skill.ts
      validate-skill.ts
      generate-codex-plugin.ts
    exports/
      codex.ts
      cursor.ts
      generic.ts
    validators/
      manifest.ts
      docs.ts
      secrets.ts
    utils/
      fs.ts
      logger.ts
      errors.ts

  skills/
    agentos-project-setup/
      SKILL.md
      scripts/
        run-agentos-init.mjs
      references/
        output-files.md
        troubleshooting.md

  plugin/
    .codex-plugin/
      plugin.json
    skills/
      agentos-project-setup/
        SKILL.md
        scripts/
        references/
    assets/
      icon.png
      logo.png

  examples/
    desktop-invoice-app/
    browser-extension/
    ai-agent/
    wordpress-plugin/

  tests/
    unit/
    integration/
    fixtures/
```

---

## 14. AI Generation Architecture

### 14.1 Provider model

Create a provider abstraction:

```ts
interface AIProvider {
  name: string;
  generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<T>;
  generateText(request: TextGenerationRequest): Promise<string>;
  testConnection(): Promise<boolean>;
}
```

MVP implements:

```txt
OpenAIProvider
MockProvider
```

Future adapters:

```txt
AnthropicProvider
OpenRouterProvider
GeminiProvider
```

### 14.2 OpenAI defaults

Default provider:

```txt
provider: openai
model: configurable, default from config
apiKey: process.env.OPENAI_API_KEY
```

The implementation must not hardcode a model forever. It can default to a currently available model but must allow override through config and CLI.

### 14.3 Generation pipeline

AgentOS should use a multi-pass generation pipeline:

#### Pass 1: Intake normalization

Input:

- raw user idea
- user answers
- optional repo summary

Output:

```ts
type ProjectProfile = {
  projectName: string;
  projectKind: string;
  targetUsers: string[];
  problem: string;
  proposedSolution: string;
  platforms: string[];
  knownStack: string[];
  constraints: string[];
  nonGoals: string[];
  risks: string[];
  unknowns: string[];
  confidence: number;
  followUpQuestions: string[];
};
```

If confidence is low, ask follow-up questions before continuing.

#### Pass 2: Artifact planning

Output:

```ts
type ArtifactPlan = {
  files: Array<{
    path: string;
    purpose: string;
    sections: string[];
    priority: "required" | "recommended" | "optional";
    targetAgents: Array<"codex" | "cursor" | "generic">;
  }>;
};
```

#### Pass 3: Document generation

Generate each document individually using:

- the normalized project profile
- the artifact plan
- the specific file purpose
- the target audience: human + coding agent

Do not ask the model to generate all files in one giant response.

#### Pass 4: Review and consistency check

Ask OpenAI to check the generated docs for:

- contradictions
- missing constraints
- vague requirements
- overbuilt scope
- unsupported assumptions
- missing validation steps
- inconsistent terminology

The reviewer should return a structured list of fixes.

#### Pass 5: Final write

Write files only after:

- schema validation passes
- markdown is non-empty
- paths are safe
- no detected secrets exist
- user approves the preview, unless `--yes` is set

---

## 15. Prompting Requirements

### 15.1 System prompt principles

The OpenAI system prompt should instruct the model to:

- generate practical, project-specific documentation
- avoid generic filler
- separate facts from assumptions
- preserve user constraints exactly
- identify unknowns instead of inventing details
- produce agent-readable execution guidance
- write concise but complete markdown
- include validation steps wherever possible
- avoid choosing dependencies unless user gave enough context or the choice is clearly justified

### 15.2 Required behavior

The model should never:

- pretend uncertain details are confirmed
- create fake package names
- assume a web app if the project is not a web app
- generate static boilerplate that ignores the user’s idea
- tell agents to “use best practices” without defining them
- include secret values or placeholder API keys beyond safe examples

### 15.3 Example generation instruction

```txt
You are generating project setup documentation for AI coding agents.
Your output must be specific to the user’s project.
Do not generate generic startup boilerplate.
Separate confirmed constraints from assumptions.
Every file must help a future coding agent make better implementation decisions.
Prefer clear checklists, acceptance criteria, and explicit non-goals.
```

---

## 16. No-Template Requirement

The user explicitly does not want local templates.

Therefore:

1. Do not fill static markdown templates with variables.
2. Do not store full document templates under `templates/`.
3. Do not generate final docs by replacing placeholders.
4. It is allowed to define:
   - schemas
   - required sections
   - generation prompts
   - validation rules
   - example outputs in tests
5. It is allowed to have a static `SKILL.md` for the AgentOS repo’s own reusable skill, because that is the product packaging, not the generated project documentation.
6. It is allowed to generate project-specific `SKILL.md` content through AI.

---

## 17. Skill and Plugin Packaging

### 17.1 AgentOS reusable skill

Path in repo:

```txt
skills/agentos-project-setup/SKILL.md
```

Purpose:

- teach agents how to use AgentOS to prepare a project
- tell agents when to run `agentos init`, `agentos brief`, `agentos refine`, and `agentos doctor`
- instruct agents to inspect generated docs before coding

Example frontmatter:

```yaml
---
name: agentos-project-setup
description: Use when setting up a new software project, creating project context, generating a PRD, defining agent instructions, bootstrapping an AI-ready repo, or preparing Codex/Cursor to build from scratch.
license: MIT
compatibility: Requires Node.js 20+, npm or pnpm, internet access, and OPENAI_API_KEY for AI generation.
---
```

### 17.2 Codex plugin package

Path in repo:

```txt
plugin/.codex-plugin/plugin.json
```

Minimum manifest:

```json
{
  "name": "agentos",
  "version": "0.1.0",
  "description": "Generate AI-ready project brains and setup workflows for coding agents.",
  "author": {
    "name": "AgentOS contributors"
  },
  "license": "MIT",
  "keywords": ["project-setup", "agents", "prd", "codex", "cursor"],
  "skills": "./skills/",
  "interface": {
    "displayName": "AgentOS",
    "shortDescription": "Prepare projects for AI coding agents",
    "longDescription": "AgentOS turns rough project ideas into project briefs, PRDs, architecture docs, agent rules, implementation plans, and project-specific skills.",
    "developerName": "AgentOS contributors",
    "category": "Productivity",
    "capabilities": ["Read", "Write"],
    "brandColor": "#2563EB",
    "defaultPrompt": [
      "Use AgentOS to initialize this project before writing code.",
      "Use AgentOS to turn this idea into an AI-ready PRD and project brain."
    ]
  }
}
```

### 17.3 Generated project-specific skill

AgentOS must generate a skill inside the target repo:

```txt
.agents/skills/project-context/SKILL.md
```

This skill should be specific to the user’s project, not generic.

---

## 18. Cursor Export

AgentOS should generate:

```txt
.cursor/rules/project-context.mdc
```

The file should contain:

- project summary
- read order
- coding constraints
- design constraints when relevant
- testing expectations
- dependency rules
- forbidden actions
- when to update docs

Cursor export should also preserve `AGENTS.md`, because multiple tools can read project-level instruction files.

---

## 19. Configuration

### 19.1 Local config file

Path:

```txt
.agentos/config.json
```

Example:

```json
{
  "schemaVersion": "1.0",
  "provider": "openai",
  "model": "gpt-5.5",
  "outputDir": "docs/agentos",
  "targets": ["codex", "cursor", "generic"],
  "repoScan": {
    "enabled": true,
    "maxFileBytes": 20000,
    "maxTotalBytes": 120000,
    "ignore": ["node_modules", ".git", "dist", "build", ".env"]
  }
}
```

### 19.2 Environment variables

```bash
OPENAI_API_KEY=...
AGENTOS_MODEL=gpt-5.5
AGENTOS_PROVIDER=openai
```

### 19.3 Global config

Optional path:

```txt
~/.agentos/config.json
```

Local config overrides global config.

---

## 20. Repository Inspection and Privacy

### 20.1 Safe default

AgentOS must show the list of files it plans to send to OpenAI before sending them.

### 20.2 Redaction

Before sending any repo content to OpenAI, redact likely secrets:

- API keys
- bearer tokens
- JWTs
- private keys
- database URLs
- passwords
- `.env` files
- SSH keys
- cloud credentials

### 20.3 Ignore file

Support:

```txt
.agentosignore
```

This file should behave similarly to `.gitignore` for AgentOS scanning.

### 20.4 No default full upload

AgentOS must never upload the entire repo by default.

---

## 21. Error Handling

Handle these errors clearly:

1. Missing `OPENAI_API_KEY`.
2. Invalid OpenAI response.
3. Structured output schema mismatch.
4. OpenAI rate limit or billing error.
5. Network unavailable.
6. File write conflict.
7. Unsafe path attempt.
8. Existing file would be overwritten.
9. Skill validation failure.
10. Secret detected in generated output.

Each error should include:

- what happened
- why it matters
- how to fix it
- whether the user can retry

---

## 22. Validation Rules

`agentos doctor` should validate:

### Required files

- `AGENTS.md`
- `.agentos/config.json`
- `.agentos/manifest.json`
- `docs/agentos/PROJECT_BRIEF.md`
- `docs/agentos/PRODUCT_REQUIREMENTS.md`
- `docs/agentos/ARCHITECTURE.md`
- `docs/agentos/IMPLEMENTATION_PLAN.md`
- `.agents/skills/project-context/SKILL.md`

### Skill rules

- `SKILL.md` has YAML frontmatter.
- `name` is lowercase kebab-case.
- `description` is non-empty.
- Body has clear instructions.
- Referenced files exist.

### Security rules

- no likely API keys in generated markdown
- no `.env` copied into docs
- no private key blocks

### Content rules

- docs are not empty
- docs mention project-specific constraints
- docs contain non-goals
- implementation plan has phases
- acceptance criteria are concrete
- agent workflow includes validation steps

---

## 23. Testing Requirements

### 23.1 Unit tests

Test:

- config loading
- safe path writer
- redaction
- schema validation
- provider abstraction
- markdown file writing
- skill validation
- manifest generation

### 23.2 Integration tests

Use temporary directories to test:

- `agentos init --dry-run`
- `agentos init --yes` with mock provider
- `agentos refine` with mock provider
- `agentos export --target cursor`
- `agentos skill pack`
- `agentos doctor`

### 23.3 Mock provider

The repo must include a mock provider so tests do not require real OpenAI calls.

### 23.4 Optional live tests

Only run live OpenAI tests when:

```bash
RUN_OPENAI_TESTS=1
OPENAI_API_KEY=...
```

### 23.5 Snapshot rules

Do not snapshot full generated prose as a fixed template. Snapshot only:

- file paths
- JSON schema shapes
- required section presence
- frontmatter structure
- manifest structure

---

## 24. Accessibility and Developer Experience

The CLI should:

- support non-interactive flags
- support `--json` output for automation
- use readable terminal output
- avoid excessive prompts
- show meaningful progress states
- work in CI with `--yes` and `--from`
- produce clean markdown without broken formatting

---

## 25. Open Source Requirements

The repo should include:

- `README.md`
- `LICENSE` using MIT unless changed by maintainer
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- example generated outputs
- GitHub Actions for tests
- release instructions
- package publishing instructions

README should clearly explain:

- what AgentOS does
- what it does not do
- how to install
- how to set `OPENAI_API_KEY`
- how to run `agentos init`
- how to use with Codex
- how to use with Cursor
- privacy model
- generated file list

---

## 26. Success Metrics

MVP success means:

1. A user can run one command and generate an AI-ready Project Brain.
2. The generated docs are project-specific, not generic.
3. Codex can read the generated `AGENTS.md` and `SKILL.md` and follow the project workflow.
4. Cursor can use the generated rule file.
5. `agentos doctor` can validate the output.
6. No API keys or secrets are written to generated files.
7. Tests pass with the mock provider.
8. The repo can be published as an npm package.
9. The repo contains a Codex plugin package for AgentOS.

---

## 27. MVP Scope

### Must build

- TypeScript CLI
- OpenAI provider
- Mock provider
- Interactive project intake
- AI-generated Project Brain files
- AI-generated `AGENTS.md`
- AI-generated project-specific Agent Skill
- Cursor rules export
- Codex plugin package for AgentOS itself
- `agentos doctor`
- secret redaction
- dry-run and diff preview
- tests
- README and examples

### Should build

- existing repo scanning
- `agentos refine`
- run history
- decisions log update
- `.agentosignore`

### Could build later

- additional providers
- hosted web app
- GitHub Action
- MCP server
- VS Code extension
- visual PRD editor
- team profiles
- marketplace publishing automation

---

## 28. Acceptance Criteria

### AC1: OpenAI setup

Given `OPENAI_API_KEY` is set, when a user runs `agentos provider test`, then AgentOS verifies connectivity and prints a success message without exposing the key.

### AC2: Missing key

Given `OPENAI_API_KEY` is missing, when a user runs `agentos init`, then AgentOS explains how to set the key and exits without writing partial generated files.

### AC3: New project generation

Given a user runs `agentos init my-project --yes`, AgentOS creates the project directory and writes all required Project Brain files.

### AC4: No static document templates

Generated project docs must be produced by the AI provider and not by placeholder substitution from local markdown templates.

### AC5: Structured planning

The artifact plan must be generated as schema-valid JSON before markdown files are generated.

### AC6: Safe writing

AgentOS must not overwrite existing files unless the user confirms or passes `--yes`.

### AC7: Skill generation

AgentOS must generate `.agents/skills/project-context/SKILL.md` with valid frontmatter and project-specific instructions.

### AC8: Codex compatibility

AgentOS must generate `AGENTS.md` with clear project guidance and read order.

### AC9: Cursor compatibility

AgentOS must generate `.cursor/rules/project-context.mdc` when Cursor export is enabled.

### AC10: Doctor validation

`agentos doctor` must pass after a successful `agentos init` run.

### AC11: Secret safety

If generated output or repo scan content contains likely secrets, AgentOS must redact or block it and produce a redaction report.

### AC12: Mock tests

The full test suite must run without a real OpenAI API key by using a mock provider.

---

## 29. Implementation Plan for Coding Agent

### Phase 1: Repo setup

- Create TypeScript package.
- Add CLI entry point.
- Add test framework.
- Add basic command routing.
- Add config loader.

### Phase 2: Provider abstraction

- Implement `AIProvider` interface.
- Implement `MockProvider`.
- Implement `OpenAIProvider` using official OpenAI SDK.
- Add provider test command.

### Phase 3: Schemas and generation pipeline

- Define project profile schema.
- Define artifact plan schema.
- Define document output schema.
- Build intake normalization.
- Build artifact planning.
- Build document generation.
- Build review pass.

### Phase 4: File writer and validation

- Implement safe path writing.
- Implement dry-run.
- Implement diff preview.
- Implement manifest writing.
- Implement doctor checks.

### Phase 5: Agent exports

- Generate `AGENTS.md`.
- Generate `.agents/skills/project-context/SKILL.md`.
- Generate `.cursor/rules/project-context.mdc`.
- Generate Codex plugin package for AgentOS reusable skill.

### Phase 6: Existing repo support

- Implement repo inspector.
- Add `.agentosignore`.
- Add redaction.
- Add confirmation before sending context.

### Phase 7: Polish and release

- Add README.
- Add examples.
- Add GitHub Actions.
- Add npm package metadata.
- Add contribution docs.

---

## 30. Handoff Prompt for Codex / Cursor / Kimi

Use this prompt to start implementation:

```txt
You are building the open-source project described in this PRD: AgentOS Skill.

Your task is to create a production-quality TypeScript CLI package that uses the OpenAI API to generate AI-ready project documentation and Agent Skills.

Read this PRD fully before coding. Then:

1. Create the repository structure described in Section 13.
2. Implement the MVP scope from Section 27.
3. Follow the acceptance criteria from Section 28.
4. Do not use static markdown templates for generated project docs.
5. Use structured schemas and AI generation for project-specific content.
6. Include a mock provider so tests run without OpenAI.
7. Use the OpenAI provider through `OPENAI_API_KEY`.
8. Generate `AGENTS.md`, Project Brain docs, `.agents/skills/project-context/SKILL.md`, and Cursor rules.
9. Package the reusable AgentOS skill and Codex plugin.
10. Add tests, README, examples, and GitHub Actions.

Before coding, produce an implementation plan with file paths. After each phase, run tests and summarize what changed.
```

---

## 31. Recommended First Commit

The first implementation commit should include:

```txt
package.json
tsconfig.json
src/cli.ts
src/commands/init.ts
src/provider/types.ts
src/provider/mock-provider.ts
src/provider/openai-provider.ts
src/generation/schemas.ts
src/generation/pipeline.ts
src/writers/write-files.ts
src/validators/docs.ts
src/validators/secrets.ts
skills/agentos-project-setup/SKILL.md
plugin/.codex-plugin/plugin.json
README.md
tests/unit/
```

---

## 32. Final Product Definition

AgentOS Skill is successful when a user can describe any project idea and receive a complete, AI-generated, version-controlled project setup layer that makes coding agents more reliable from the first task.

It should not be a template generator. It should be an AI-powered setup skill that creates the reusable context, constraints, and workflow every coding agent needs before building.
