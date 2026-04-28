import { describe, it, expect } from "vitest";
import { detectSecrets, redactSecrets } from "../../src/validators/secrets.js";

describe("detectSecrets", () => {
  it("detects OpenAI API keys", () => {
    const text = "key: sk-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12";
    const findings = detectSecrets(text);
    expect(findings.length).toBeGreaterThan(0);
  });

  it("detects bearer tokens", () => {
    const text = "Authorization: Bearer abcdef1234567890abcdef1234567890";
    const findings = detectSecrets(text);
    expect(findings.length).toBeGreaterThan(0);
  });

  it("returns empty for clean text", () => {
    const text = "This is a normal document about project setup.";
    const findings = detectSecrets(text);
    expect(findings.length).toBe(0);
  });
});

describe("redactSecrets", () => {
  it("redacts OpenAI keys", () => {
    const text = "sk-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12";
    const redacted = redactSecrets(text);
    expect(redacted).not.toContain("sk-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12");
    expect(redacted).toContain("[REDACTED_OPENAI_KEY]");
  });

  it("redacts database URLs", () => {
    const text = "postgresql://user:secretpassword@localhost/db";
    const redacted = redactSecrets(text);
    expect(redacted).toContain("[REDACTED]");
  });
});
