import { OpenAIProvider } from "../provider/openai-provider.js";
import { MockProvider } from "../provider/mock-provider.js";
import { logger } from "../utils/logger.js";
import { loadConfig } from "../utils/config.js";

export async function providerTestCommand() {
  const config = loadConfig(process.cwd());
  logger.info(`Testing provider: ${config.provider}`);

  if (config.provider === "openai") {
    try {
      const provider = new OpenAIProvider(config.model);
      const ok = await provider.testConnection();
      if (ok) {
        logger.success("OpenAI connection OK");
      } else {
        logger.error("OpenAI connection failed");
        process.exit(1);
      }
    } catch (err) {
      logger.error(`OpenAI test failed: ${(err as Error).message}`);
      process.exit(1);
    }
  } else if (config.provider === "mock") {
    const provider = new MockProvider();
    const ok = await provider.testConnection();
    if (ok) {
      logger.success("Mock provider OK");
    } else {
      logger.error("Mock provider failed");
      process.exit(1);
    }
  } else {
    logger.error(`Unknown provider: ${config.provider}`);
    process.exit(1);
  }
}
