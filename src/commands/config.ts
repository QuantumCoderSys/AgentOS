import { loadConfig, saveLocalConfig, type AgentOSConfig } from "../utils/config.js";
import { logger } from "../utils/logger.js";

export async function configCommand() {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  logger.heading("AgentOS configuration");
  logger.json(config);
}

export async function configSetCommand(key: string, value: string) {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  const updates: Partial<AgentOSConfig> = {};

  switch (key) {
    case "provider":
      updates.provider = value;
      break;
    case "model":
      updates.model = value;
      break;
    case "outputDir":
      updates.outputDir = value;
      break;
    case "targets":
      updates.targets = value
        .split(",")
        .map((target) => target.trim())
        .filter(Boolean);
      break;
    case "repoScan.enabled":
      updates.repoScan = { ...config.repoScan, enabled: value === "true" };
      break;
    default:
      logger.error(`Unsupported config key: ${key}`);
      logger.info("Supported keys: provider, model, outputDir, targets, repoScan.enabled");
      process.exit(1);
  }

  saveLocalConfig(cwd, updates);
  logger.success(`Set ${key}`);
}
