import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { loadConfig } from "../utils/config.js";
import { logger } from "../utils/logger.js";
import { readManifest } from "../validators/manifest.js";
import { detectSecrets } from "../validators/secrets.js";

interface DoctorOptions {
  strict?: boolean;
}

export async function doctorCommand(options: DoctorOptions) {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  const strict = options.strict || false;
  let passed = 0;
  let failed = 0;

  const requiredFiles = [
    "AGENTS.md",
    join(".agentos", "config.json"),
    join(".agentos", "manifest.json"),
    join(".agentos", "run-history.jsonl"),
    join(".agentos", "redaction-report.json"),
    join(".agentos", "generated-by.md"),
    join(config.outputDir, "PROJECT_BRIEF.md"),
    join(config.outputDir, "PRODUCT_REQUIREMENTS.md"),
    join(config.outputDir, "ARCHITECTURE.md"),
    join(config.outputDir, "IMPLEMENTATION_PLAN.md"),
    join(config.outputDir, "AGENT_WORKFLOW.md"),
    join(config.outputDir, "ACCEPTANCE_CRITERIA.md"),
    join(config.outputDir, "SECURITY_AND_PRIVACY.md"),
    join(config.outputDir, "RISK_REGISTER.md"),
    join(config.outputDir, "DECISIONS_LOG.md"),
    join(config.outputDir, "GLOSSARY.md"),
    join(".agents", "skills", "project-context", "SKILL.md"),
    join(".agents", "skills", "project-context", "references", "project-summary.md"),
    join(".agents", "skills", "project-context", "references", "implementation-plan.md"),
    join(".agents", "skills", "project-context", "references", "validation-checklist.md"),
  ];

  logger.heading("Doctor: checking required files");
  for (const file of requiredFiles) {
    const path = join(cwd, file);
    if (existsSync(path)) {
      logger.success(file);
      passed++;
    } else {
      logger.error(`Missing: ${file}`);
      failed++;
    }
  }

  logger.heading("Doctor: checking manifest");
  const manifest = readManifest(cwd);
  if (manifest) {
    logger.success("manifest.json is valid");
    passed++;
  } else {
    logger.error("manifest.json is missing or invalid");
    failed++;
  }

  logger.heading("Doctor: checking SKILL.md frontmatter");
  const skillPath = join(cwd, ".agents", "skills", "project-context", "SKILL.md");
  if (existsSync(skillPath)) {
    const skill = readFileSync(skillPath, "utf-8");
    if (skill.startsWith("---") && skill.includes("name:") && skill.includes("description:")) {
      logger.success("SKILL.md has valid frontmatter");
      passed++;
    } else {
      logger.error("SKILL.md missing valid frontmatter");
      failed++;
    }
  } else {
    failed++;
  }

  logger.heading("Doctor: checking for secrets in generated docs");
  const docsDir = join(cwd, config.outputDir);
  let secretIssues = 0;
  if (existsSync(docsDir)) {
    const files = [
      "PROJECT_BRIEF.md",
      "PRODUCT_REQUIREMENTS.md",
      "ARCHITECTURE.md",
      "IMPLEMENTATION_PLAN.md",
      "AGENT_WORKFLOW.md",
      "ACCEPTANCE_CRITERIA.md",
      "TECH_DECISIONS.md",
      "DESIGN_DIRECTION.md",
      "SECURITY_AND_PRIVACY.md",
      "RISK_REGISTER.md",
      "DECISIONS_LOG.md",
      "GLOSSARY.md",
    ];
    for (const f of files) {
      const p = join(docsDir, f);
      if (!existsSync(p)) continue;
      const content = readFileSync(p, "utf-8");
      const findings = detectSecrets(content);
      if (findings.length > 0) {
        logger.error(`Secrets in ${f}`);
        secretIssues++;
      }
    }
  }
  if (secretIssues === 0) {
    logger.success("No secrets detected in generated docs");
    passed++;
  } else {
    failed++;
  }

  logger.heading("Doctor: checking content quality");
  if (existsSync(docsDir)) {
    const generatedDocs = [
      "PROJECT_BRIEF.md",
      "PRODUCT_REQUIREMENTS.md",
      "ARCHITECTURE.md",
      "IMPLEMENTATION_PLAN.md",
      "AGENT_WORKFLOW.md",
      "ACCEPTANCE_CRITERIA.md",
      "SECURITY_AND_PRIVACY.md",
      "RISK_REGISTER.md",
      "DECISIONS_LOG.md",
      "GLOSSARY.md",
    ];
    for (const doc of generatedDocs) {
      const path = join(docsDir, doc);
      if (!existsSync(path)) continue;
      const content = readFileSync(path, "utf-8").trim();
      if (content.length > 0) {
        logger.success(`${doc} is not empty`);
        passed++;
      } else {
        logger.error(`${doc} is empty`);
        failed++;
      }
    }

    const briefPath = join(docsDir, "PROJECT_BRIEF.md");
    if (existsSync(briefPath)) {
      const brief = readFileSync(briefPath, "utf-8");
      const hasNonGoals = /non-?goal/i.test(brief);
      const hasConstraints = /constraint/i.test(brief);
      if (hasNonGoals && hasConstraints) {
        logger.success("PROJECT_BRIEF.md has non-goals and constraints");
        passed++;
      } else {
        logger.warn("PROJECT_BRIEF.md missing non-goals or constraints");
        if (strict) failed++;
      }
    }
  }

  logger.newline();
  logger.heading(`Doctor results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
