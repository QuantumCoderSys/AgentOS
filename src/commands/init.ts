import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import type { AIProvider } from "../provider/types.js";
import { OpenAIProvider } from "../provider/openai-provider.js";
import { MockProvider } from "../provider/mock-provider.js";
import { GenerationPipeline } from "../generation/pipeline.js";
import { createWritePlan, executeWritePlan, previewPlan } from "../writers/write-files.js";
import { detectSecrets } from "../validators/secrets.js";
import { redactSecrets } from "../validators/secrets.js";
import { logger } from "../utils/logger.js";
import { loadConfig } from "../utils/config.js";
import { writeFileSafe } from "../utils/fs.js";
import { AgentOSError } from "../utils/errors.js";
import { generateAgentsMd } from "../exports/codex.js";
import { generateCursorRules } from "../exports/cursor.js";
import { generateSkill, generateSkillReferences } from "../skill/generate-skill.js";
import { inspectRepo } from "../repo-inspector/inspect.js";

interface InitOptions {
  existing?: boolean;
  agent?: string;
  model?: string;
  yes?: boolean;
  dryRun?: boolean;
  repoScan?: boolean;
  output?: string;
  from?: string;
  stdin?: boolean;
}

export async function initCommand(directory: string | undefined, options: InitOptions) {
  const cwd = directory ? join(process.cwd(), directory) : process.cwd();

  if (directory && !existsSync(cwd)) {
    mkdirSync(cwd, { recursive: true });
    logger.success(`Created directory: ${cwd}`);
  }

  const config = loadConfig(cwd);
  const model = options.model || config.model;
  const outputDir = options.output || config.outputDir;
  const dryRun = options.dryRun || false;
  const yes = options.yes || false;

  let provider: AIProvider;
  try {
    provider = new OpenAIProvider(model);
  } catch {
    logger.warn("OPENAI_API_KEY not set; using mock provider");
    provider = new MockProvider();
  }

  const rawIdea = await collectIdea(options);
  const answers = await collectAnswers(options);

  let repoSummary: string | undefined;
  let redactionReport = { scannedFiles: [] as string[], redactedFiles: [] as string[], skipped: [] as string[] };
  if (options.existing && options.repoScan !== false) {
    const inspected = summarizeRepo(cwd, config.repoScan);
    repoSummary = inspected.summary;
    redactionReport = {
      scannedFiles: inspected.scannedFiles,
      redactedFiles: inspected.redactedFiles,
      skipped: inspected.skipped,
    };
  }

  logger.info("Generating Project Brain...");
  const pipeline = new GenerationPipeline(provider);
  const result = await pipeline.run(rawIdea, answers, repoSummary);

  const allDocuments: Record<string, string> = { ...result.documents };

  const agentsMd = generateAgentsMd(result.profile, result.artifactPlan, outputDir);
  allDocuments["AGENTS.md"] = agentsMd;

  const skillContent = generateSkill(result.profile, result.artifactPlan, outputDir);
  allDocuments[".agents/skills/project-context/SKILL.md"] = skillContent;
  const skillReferences = generateSkillReferences(result.profile, result.artifactPlan, outputDir);
  for (const [path, content] of Object.entries(skillReferences)) {
    allDocuments[`.agents/skills/project-context/${path}`] = content;
  }

  if (config.targets.includes("cursor") || options.agent === "cursor") {
    const cursorRules = generateCursorRules(result.profile, outputDir);
    allDocuments[".cursor/rules/project-context.mdc"] = cursorRules;
  }

  for (const [path, content] of Object.entries(allDocuments)) {
    const findings = detectSecrets(content);
    if (findings.length > 0) {
      logger.error(`Secrets detected in ${path}:`);
      findings.forEach((f) => logger.error(`  ${f}`));
      throw new AgentOSError("Secret detected in generated output", "SECRET_DETECTED");
    }
  }

  const plans = createWritePlan(cwd, allDocuments, result.artifactPlan);

  if (!yes) {
    previewPlan(plans);
    logger.newline();
    const confirmed = await confirm("Write these files?");
    if (!confirmed) {
      logger.info("Aborted. No files written.");
      return;
    }
  }

  const results = executeWritePlan(cwd, plans, dryRun);
  for (const r of results) {
    if (r.dryRun) {
      logger.info(`[dry-run] Would write: ${r.path}`);
    } else if (r.written) {
      logger.success(`Wrote: ${r.path}${r.existing ? " (overwritten)" : ""}`);
    } else {
      logger.error(`Failed: ${r.path}`);
    }
  }

  const manifest = {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    projectName: result.profile.projectName,
    files: result.artifactPlan.files.map((f) => ({
      path: f.path,
      purpose: f.purpose,
      priority: f.priority,
    })),
    agentTargets: Array.from(new Set([options.agent || "codex", ...config.targets])),
    provider: config.provider,
    model,
  };

  if (!dryRun) {
    writeFileSafe(join(cwd, ".agentos/manifest.json"), JSON.stringify(manifest, null, 2));
    writeFileSafe(join(cwd, ".agentos/config.json"), JSON.stringify(config, null, 2));
    writeFileSafe(join(cwd, ".agentos/redaction-report.json"), JSON.stringify(redactionReport, null, 2));
    writeFileSafe(
      join(cwd, ".agentos/run-history.jsonl"),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        command: "init",
        provider: provider.name,
        model,
        dryRun,
        files: Object.keys(allDocuments),
      }) + "\n"
    );
    writeFileSafe(
      join(cwd, ".agentos/generated-by.md"),
      `# Generated by AgentOS\n\n- Date: ${new Date().toISOString()}\n- Provider: ${config.provider}\n- Model: ${model}\n- Version: 0.1.0\n`
    );
    logger.success("Wrote: .agentos/manifest.json");
  }

  logger.newline();
  logger.heading("Next steps:");
  logger.info("1. Review docs/agentos/ files");
  logger.info("2. In Codex, AGENTS.md is read before each task");
  logger.info("3. In Codex: Use $project-context to load the skill");
  if (config.targets.includes("cursor")) {
    logger.info("4. Cursor users: rules are in .cursor/rules/project-context.mdc");
  }
}

async function collectIdea(options: InitOptions): Promise<string> {
  if (options.from) {
    const { readFileSync } = await import("fs");
    return readFileSync(options.from, "utf-8").trim();
  }
  if (options.stdin) {
    const chunks: Buffer[] = [];
    process.stdin.on("data", (c) => chunks.push(c));
    return new Promise((resolve) => {
      process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8").trim()));
    });
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const idea = await ask(rl, "What are you building?\n> ");
  rl.close();
  return idea;
}

async function collectAnswers(options: InitOptions): Promise<Record<string, string>> {
  if (options.from || options.stdin) return {};

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answers: Record<string, string> = {};

  const constraints = await ask(rl, "Known constraints? (stack, platform, etc.)\n> ");
  if (constraints) answers["Known constraints"] = constraints;

  const users = await ask(rl, "Who will use it?\n> ");
  if (users) answers["Target users"] = users;

  const agent = await ask(rl, "Target agent? (codex/cursor/generic)\n> ");
  if (agent) answers["Target agent"] = agent;

  rl.close();
  return answers;
}

function summarizeRepo(
  cwd: string,
  options: {
    maxFileBytes: number;
    maxTotalBytes: number;
    ignore: string[];
  }
): { summary: string; scannedFiles: string[]; redactedFiles: string[]; skipped: string[] } {
  const inspected = inspectRepo(cwd, options);
  const allowedRootFiles = new Set([
    "README.md",
    "package.json",
    "pyproject.toml",
    "Cargo.toml",
    "go.mod",
    "composer.json",
  ]);
  const allowedSourceExtensions = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".rs",
    ".go",
    ".php",
    ".java",
    ".kt",
    ".swift",
    ".cs",
  ]);

  const selected = inspected.files.filter((file) => {
    if (allowedRootFiles.has(file.path)) return true;
    if (!file.path.startsWith("src/")) return false;
    return Array.from(allowedSourceExtensions).some((ext) => file.path.endsWith(ext));
  });

  const redactedFiles: string[] = [];
  const parts = selected.map((file) => {
    const redacted = redactSecrets(file.content);
    if (redacted !== file.content) redactedFiles.push(file.path);
    return `--- ${file.path} (${file.size} bytes) ---\n${redacted.slice(0, options.maxFileBytes)}`;
  });

  logger.heading("Existing repository scan");
  if (selected.length === 0) {
    logger.info("No safe repository files found to summarize.");
  } else {
    logger.info("Files summarized for generation:");
    selected.forEach((file) => logger.info(`  - ${file.path}`));
  }

  return {
    summary: parts.join("\n\n"),
    scannedFiles: selected.map((file) => file.path),
    redactedFiles,
    skipped: inspected.skipped,
  };
}

function ask(rl: ReturnType<typeof createInterface>, q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await ask(rl, `${question} (y/N) `);
  rl.close();
  return answer.toLowerCase().startsWith("y");
}
