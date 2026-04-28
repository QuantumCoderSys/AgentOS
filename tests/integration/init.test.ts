import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";

describe("agentos init --dry-run", () => {
  let tempDir: string;
  const cliPath = join(process.cwd(), "dist", "cli.js");

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "agentos-integ-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it("can be invoked with --dry-run", () => {
    const ideaFile = join(tempDir, "idea.txt");
    writeFileSync(ideaFile, "A CLI tool for managing invoices.");
    const result = execSync(
      `node "${cliPath}" init "${tempDir}/test-project" --yes --dry-run --from "${ideaFile}" --agent generic`,
      { cwd: process.cwd(), encoding: "utf-8", env: { ...process.env } }
    );
    expect(result).toContain("[dry-run]");
  });
});

describe("agentos doctor", () => {
  let tempDir: string;
  const cliPath = join(process.cwd(), "dist", "cli.js");

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "agentos-doctor-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it("fails when manifest is missing", () => {
    try {
      execSync(`node "${cliPath}" doctor`, {
        cwd: tempDir,
        encoding: "utf-8",
      });
      expect(false).toBe(true);
    } catch (err: any) {
      expect(err.status).toBe(1);
    }
  });
});
