const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{48,}/,
  /[a-zA-Z0-9_-]*api[_-]?key[a-zA-Z0-9_-]*\s*[:=]\s*['"]?[a-zA-Z0-9]{16,}/i,
  /bearer\s+[a-zA-Z0-9_\-\.]{20,}/i,
  /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*/,
  /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /[a-zA-Z0-9_-]*password[a-zA-Z0-9_-]*\s*[:=]\s*['"]?[^\s'"]{8,}/i,
  /[a-zA-Z0-9_-]*secret[a-zA-Z0-9_-]*\s*[:=]\s*['"]?[^\s'"]{8,}/i,
  /postgres(ql)?:\/\/[^:]+:[^@]+@/,
  /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/,
  /mysql:\/\/[^:]+:[^@]+@/,
  /redis:\/\/:[^@]+@/,
];

export function detectSecrets(text: string): string[] {
  const findings: string[] = [];
  for (const pattern of SECRET_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      findings.push(`Matched: ${matches[0].slice(0, 30)}...`);
    }
  }
  return findings;
}

export function redactSecrets(text: string): string {
  let redacted = text;
  redacted = redacted.replace(/sk-[a-zA-Z0-9]{48,}/g, "[REDACTED_OPENAI_KEY]");
  redacted = redacted.replace(
    /([a-zA-Z0-9_-]*api[_-]?key[a-zA-Z0-9_-]*\s*[:=]\s*['"]?)[a-zA-Z0-9]{16,}/gi,
    "$1[REDACTED]"
  );
  redacted = redacted.replace(/bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi, "Bearer [REDACTED]");
  redacted = redacted.replace(/eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*/g, "[REDACTED_JWT]");
  redacted = redacted.replace(
    /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    "[REDACTED_PRIVATE_KEY]"
  );
  redacted = redacted.replace(/AKIA[0-9A-Z]{16}/g, "[REDACTED_AWS_KEY]");
  redacted = redacted.replace(
    /postgres(ql)?:\/\/[^:]+:[^@]+@/g,
    "postgresql://[REDACTED]@"
  );
  redacted = redacted.replace(
    /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/g,
    "mongodb://[REDACTED]@"
  );
  redacted = redacted.replace(/mysql:\/\/[^:]+:[^@]+@/g, "mysql://[REDACTED]@");
  redacted = redacted.replace(/redis:\/\/:[^@]+@/g, "redis://[REDACTED]@");
  return redacted;
}
