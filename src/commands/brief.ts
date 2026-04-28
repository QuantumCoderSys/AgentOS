import { readFileSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import type { AIProvider } from "../provider/types.js";
import { OpenAIProvider } from "../provider/openai-provider.js";
import { MockProvider } from "../provider/mock-provider.js";
import { GenerationPipeline } from "../generation/pipeline.js";
import { createWritePlan, executeWritePlan, previewPlan } from "../writers/write-files.js";
import { detectSecrets } from "../validators/secrets.js";
import { logger } from "../utils/logger.js";
import { loadConfig } from "../utils/config.js";
import { writeFileSafe } from "../utils/fs.js";
import { generateAgentsMd } from "../exports/codex.js";
import { generateSkill } from "../skill/generate-skill.js";

interface BriefOptions {
  from?: string;
  stdin?: boolean;
  interactive?: boolean;
  agent?: string;
  yes?: boolean;
  dryRun?: boolean;
}

export async function briefCommand(options: BriefOptions) {
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  let provider: AIProvider;
  try {
    provider = new OpenAIProvider(config.model);
  } catch {
    logger.warn("OPENAI_API_KEY not set; using mock provider");
    provider = new MockProvider();
  }

  let rawIdea = "";
  if (options.from) {
    rawIdea = readFileSync(options.from, "utf-8").trim();
  } else if (options.stdin) {
    const chunks: Buffer[] = [];
    process.stdin.on("data", (c) => chunks.push(c));
    rawIdea = await new Promise((resolve) => {
      process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8").trim()));
    });
  } else if (options.interactive) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rawIdea = await new Promise((resolve) => rl.question("Project idea:\n> ", (a) => {
      rl.close();
      resolve(a);
    }));
  } else {
    logger.error("Provide --from, --stdin, or --interactive");
    process.exit(1);
  }

  const pipeline = new GenerationPipeline(provider);
  const result = await pipeline.run(rawIdea, {});

  const allDocuments: Record<string, string> = { ...result.documents };
  allDocuments["AGENTS.md"] = generateAgentsMd(result.profile, result.artifactPlan, config.outputDir);
  allDocuments[".agents/skills/project-context/SKILL.md"] = generateSkill(result.profile, result.artifactPlan, config.outputDir);

  for (const [path, content] of Object.entries(allDocuments)) {
    const findings = detectSecrets(content);
    if (findings.length > 0) {
      logger.error(`Secrets detected in ${path}`);
      process.exit(1);
    }
  }

  const plans = createWritePlan(cwd, allDocuments, result.artifactPlan);

  if (!options.yes) {
    previewPlan(plans);
    const answer = await new Promise<string>((resolve) => {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      rl.question("Write files? (y/N) ", (a) => { rl.close(); resolve(a); });
    });
    if (!answer.toLowerCase().startsWith("y")) {
      logger.info("Aborted.");
      return;
    }
  }

  executeWritePlan(cwd, plans, options.dryRun);

  if (!options.dryRun) {
    writeFileSafe(join(cwd, ".agentos/manifest.json"), JSON.stringify({
      schemaVersion: "1.0",
      generatedAt: new Date().toISOString(),
      projectName: result.profile.projectName,
      files: result.artifactPlan.files.map((f) => ({ path: f.path, purpose: f.purpose, priority: f.priority })),
      agentTargets: [options.agent || "generic"],
      provider: config.provider,
      model: config.model,
    }, null, 2));
  }
}
