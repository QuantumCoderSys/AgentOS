import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import type { AIProvider } from "../provider/types.js";
import { OpenAIProvider } from "../provider/openai-provider.js";
import { MockProvider } from "../provider/mock-provider.js";
import { logger } from "../utils/logger.js";
import { loadConfig } from "../utils/config.js";
import { writeFileSafe } from "../utils/fs.js";

interface RefineOptions {
  from?: string;
  dryRun?: boolean;
  yes?: boolean;
}

export async function refineCommand(message: string | undefined, options: RefineOptions) {
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  if (!existsSync(join(cwd, ".agentos", "manifest.json"))) {
    logger.error("No existing AgentOS manifest found. Run `agentos init` first.");
    process.exit(1);
  }

  let updateText = "";
  if (options.from) {
    updateText = readFileSync(options.from, "utf-8").trim();
  } else if (message) {
    updateText = message;
  } else {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    updateText = await new Promise((resolve) =>
      rl.question("What changed?\n> ", (a) => { rl.close(); resolve(a); })
    );
  }

  let provider: AIProvider;
  try {
    provider = new OpenAIProvider(config.model);
  } catch {
    provider = new MockProvider();
  }

  const existingBrief = readFileSafe(join(cwd, config.outputDir, "PROJECT_BRIEF.md"));
  const existingPRD = readFileSafe(join(cwd, config.outputDir, "PRODUCT_REQUIREMENTS.md"));
  const existingArch = readFileSafe(join(cwd, config.outputDir, "ARCHITECTURE.md"));

  const systemPrompt = `You are updating project documentation based on a change request.
Respond with a JSON object containing:
- updatedBrief: updated PROJECT_BRIEF.md content (or original if unchanged)
- updatedPRD: updated PRODUCT_REQUIREMENTS.md content (or original if unchanged)
- updatedArch: updated ARCHITECTURE.md content (or original if unchanged)
- decisions: array of {decision, rationale} objects
Only include fields that changed. If a section did not change, omit it.`;

  const userPrompt = `Change request: ${updateText}

Existing brief:\n${existingBrief.slice(0, 3000)}

Existing PRD:\n${existingPRD.slice(0, 3000)}

Existing architecture:\n${existingArch.slice(0, 3000)}`;

  logger.info("Generating change plan...");
  const result = await provider.generateStructured<{
    updatedBrief?: string;
    updatedPRD?: string;
    updatedArch?: string;
    decisions: Array<{ decision: string; rationale: string }>;
  }>({
    systemPrompt,
    userPrompt,
    schema: {
      type: "object",
      properties: {
        updatedBrief: { type: "string" },
        updatedPRD: { type: "string" },
        updatedArch: { type: "string" },
        decisions: {
          type: "array",
          items: {
            type: "object",
            properties: { decision: { type: "string" }, rationale: { type: "string" } },
            required: ["decision", "rationale"],
            additionalProperties: false,
          },
        },
      },
      required: ["decisions"],
      additionalProperties: false,
    },
    temperature: 0.3,
  });

  if (result.updatedBrief && !options.dryRun) {
    writeFileSafe(join(cwd, config.outputDir, "PROJECT_BRIEF.md"), result.updatedBrief);
    logger.success("Updated PROJECT_BRIEF.md");
  }
  if (result.updatedPRD && !options.dryRun) {
    writeFileSafe(join(cwd, config.outputDir, "PRODUCT_REQUIREMENTS.md"), result.updatedPRD);
    logger.success("Updated PRODUCT_REQUIREMENTS.md");
  }
  if (result.updatedArch && !options.dryRun) {
    writeFileSafe(join(cwd, config.outputDir, "ARCHITECTURE.md"), result.updatedArch);
    logger.success("Updated ARCHITECTURE.md");
  }

  if (result.decisions.length > 0) {
    const logEntries = result.decisions.map(
      (d) => `- **${d.decision}**\n  - Rationale: ${d.rationale}\n`
    );
    const logPath = join(cwd, config.outputDir, "DECISIONS_LOG.md");
    const existingLog = existsSync(logPath) ? readFileSync(logPath, "utf-8") : "# Decisions Log\n\n";
    const newLog = `${existingLog}\n## ${new Date().toISOString()}\n\n${logEntries.join("\n")}\n`;
    if (!options.dryRun) {
      writeFileSafe(logPath, newLog);
      logger.success("Updated DECISIONS_LOG.md");
    }
  }

  logger.success("Refinement complete.");
}

function readFileSafe(path: string): string {
  try { return readFileSync(path, "utf-8"); } catch { return ""; }
}
