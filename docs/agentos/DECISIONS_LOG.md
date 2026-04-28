# Decisions Log

## 2026-04-28

- **Guarantee the full PRD Project Brain file set in the generation pipeline**
  - Rationale: Provider-generated artifact plans can omit required AgentOS files. The pipeline now merges PRD-required files into the artifact plan before document generation so `init`, `doctor`, and downstream exports share the same expectations.

- **Generate project skill reference files alongside SKILL.md**
  - Rationale: The PRD requires `.agents/skills/project-context/references/` files. These are derived from the generated profile and artifact plan so the skill remains portable without adding static markdown templates for generated project docs.

- **Persist init metadata for run history and redaction reports**
  - Rationale: Existing-repository mode should be auditable. AgentOS now records scanned/redacted files and each init run under `.agentos/` without storing secrets.

- **Implement local `agentos config set` for supported keys**
  - Rationale: The PRD lists config management as an MVP command. Persisting supported local keys lets users override provider, model, output directory, targets, and repo scanning behavior without editing JSON by hand.
