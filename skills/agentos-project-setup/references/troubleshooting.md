# Troubleshooting

## Missing OPENAI_API_KEY

```bash
export OPENAI_API_KEY=sk-...
```

## Rate limits

- Wait and retry
- Use `agentos init --dry-run` to preview without API calls
- Run tests with mock provider

## Empty or generic docs

- Provide a more detailed project idea
- Use `agentos brief --interactive` for more questions

## Existing file overwrite

- Use `--dry-run` to preview
- Confirm overwrite or cancel
