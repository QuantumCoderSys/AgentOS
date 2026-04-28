import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { loadConfig } from "../../src/utils/config.js";
import { configSetCommand } from "../../src/commands/config.js";

describe("loadConfig", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "agentos-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it("returns defaults when no config exists", () => {
    const config = loadConfig(tempDir);
    expect(config.provider).toBe("openai");
    expect(config.outputDir).toBe("docs/agentos");
    expect(config.schemaVersion).toBe("1.0");
  });

  it("loads local config when present", () => {
    mkdirSync(join(tempDir, ".agentos"));
    writeFileSync(
      join(tempDir, ".agentos/config.json"),
      JSON.stringify({ provider: "mock", outputDir: "custom/docs" })
    );
    const config = loadConfig(tempDir);
    expect(config.provider).toBe("mock");
    expect(config.outputDir).toBe("custom/docs");
  });

  it("sets supported local config values", async () => {
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    try {
      await configSetCommand("model", "gpt-test");
      const config = loadConfig(tempDir);
      expect(config.model).toBe("gpt-test");
    } finally {
      process.chdir(originalCwd);
    }
  });
});
