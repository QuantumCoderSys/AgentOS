export class AgentOSError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly fixable: boolean = true
  ) {
    super(message);
    this.name = "AgentOSError";
  }
}

export class MissingApiKeyError extends AgentOSError {
  constructor(provider: string) {
    super(
      `Missing API key for ${provider}. Set ${provider.toUpperCase()}_API_KEY environment variable.`,
      "MISSING_API_KEY",
      true
    );
  }
}

export class ProviderError extends AgentOSError {
  constructor(message: string) {
    super(message, "PROVIDER_ERROR", true);
  }
}

export class SchemaValidationError extends AgentOSError {
  constructor(message: string) {
    super(message, "SCHEMA_VALIDATION_ERROR", true);
  }
}

export class UnsafePathError extends AgentOSError {
  constructor(path: string) {
    super(`Unsafe path detected: ${path}`, "UNSAFE_PATH", false);
  }
}

export class SecretDetectedError extends AgentOSError {
  constructor(file: string) {
    super(
      `Potential secret detected in generated output for ${file}. Review and regenerate.`,
      "SECRET_DETECTED",
      true
    );
  }
}
