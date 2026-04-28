# Security Policy

## Reporting vulnerabilities

Please report security vulnerabilities to the maintainers via email or GitHub private vulnerability reporting.

## What we do

- Redact secrets before sending repo context to OpenAI
- Validate that generated docs do not contain secrets
- Never write API keys to generated files
- Use environment variables only for API keys

## What you should do

- Keep `OPENAI_API_KEY` private
- Review generated files before committing
- Use `.agentosignore` to exclude sensitive files
