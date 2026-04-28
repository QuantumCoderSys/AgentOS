import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { logger } from "./logger.js";

export interface AgentOSConfig {
  schemaVersion: string;
  provider: string;
  model: string;
  outputDir: string;
  targets: string[];
  repoScan: {
    enabled: boolean;
    maxFileBytes: number;
    maxTotalBytes: number;
    ignore: string[];
  };
}

const DEFAULT_CONFIG: AgentOSConfig = {
  schemaVersion: "1.0",
  provider: "openai",
  model: "gpt-4.1",
  outputDir: "docs/agentos",
  targets: ["codex", "cursor", "generic"],
  repoScan: {
    enabled: true,
    maxFileBytes: 20000,
    maxTotalBytes: 120000,
    ignore: ["node_modules", ".git", "dist", "build", ".env", ".agentos"],
  },
};

export function loadConfig(cwd: string): AgentOSConfig {
  const globalPath = join(homedir(), ".agentos", "config.json");
  const localPath = join(cwd, ".agentos", "config.json");

  let config = { ...DEFAULT_CONFIG };

  if (existsSync(globalPath)) {
    try {
      const global = JSON.parse(readFileSync(globalPath, "utf-8"));
      config = { ...config, ...global };
    } catch {
      logger.warn("Failed to parse global config, using defaults");
    }
  }

  if (existsSync(localPath)) {
    try {
      const local = JSON.parse(readFileSync(localPath, "utf-8"));
      config = { ...config, ...local };
    } catch {
      logger.warn("Failed to parse local config, using defaults");
    }
  }

  if (process.env.AGENTOS_PROVIDER) config.provider = process.env.AGENTOS_PROVIDER;
  if (process.env.AGENTOS_MODEL) config.model = process.env.AGENTOS_MODEL;

  return config;
}

export function saveLocalConfig(cwd: string, overrides: Partial<AgentOSConfig>): void {
  const dir = join(cwd, ".agentos");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const existing = loadConfig(cwd);
  const merged = { ...existing, ...overrides };
  writeFileSync(join(dir, "config.json"), JSON.stringify(merged, null, 2) + "\n");
}
