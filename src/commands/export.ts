import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { loadConfig } from "../utils/config.js";
import { logger } from "../utils/logger.js";
import { writeFileSafe } from "../utils/fs.js";
import { readManifest } from "../validators/manifest.js";
import { generateAgentsMd } from "../exports/codex.js";
import { generateCursorRules } from "../exports/cursor.js";
import { generateGenericRules } from "../exports/generic.js";
import { generateSkill, generateSkillReferences } from "../skill/generate-skill.js";

interface ExportOptions {
  target?: string;
  all?: boolean;
  output?: string;
}

export async function exportCommand(options: ExportOptions) {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  const manifest = readManifest(cwd);

  if (!manifest) {
    logger.error("No AgentOS manifest found. Run `agentos init` first.");
    process.exit(1);
  }

  const targets: string[] = [];
  if (options.all) {
    targets.push("codex", "cursor", "generic");
  } else if (options.target) {
    targets.push(options.target);
  } else {
    targets.push(...config.targets);
  }

  const outputDir = options.output || cwd;

  for (const target of targets) {
    logger.info(`Exporting for ${target}...`);
    switch (target) {
      case "codex": {
        const profile = { projectName: manifest.projectName } as any;
        const content = generateAgentsMd(profile, { files: manifest.files.map((f: any) => ({ ...f, sections: [], targetAgents: ["codex"] })) }, config.outputDir);
        writeFileSafe(join(outputDir, "AGENTS.md"), content);
        logger.success("Wrote AGENTS.md");
        break;
      }
      case "cursor": {
        const profile = { projectName: manifest.projectName } as any;
        const content = generateCursorRules(profile, config.outputDir);
        const cursorDir = join(outputDir, ".cursor", "rules");
        if (!existsSync(cursorDir)) mkdirSync(cursorDir, { recursive: true });
        writeFileSafe(join(cursorDir, "project-context.mdc"), content);
        logger.success("Wrote .cursor/rules/project-context.mdc");
        break;
      }
      case "generic": {
        const content = generateGenericRules(manifest);
        writeFileSafe(join(outputDir, "AGENTS.md"), content);
        logger.success("Wrote AGENTS.md (generic)");
        break;
      }
    }
  }

  const skillContent = generateSkill(
    { projectName: manifest.projectName } as any,
    { files: manifest.files.map((f: any) => ({ ...f, sections: [], targetAgents: ["codex"] })) },
    config.outputDir
  );
  const skillDir = join(outputDir, ".agents", "skills", "project-context");
  if (!existsSync(skillDir)) mkdirSync(skillDir, { recursive: true });
  writeFileSafe(join(skillDir, "SKILL.md"), skillContent);
  logger.success("Wrote .agents/skills/project-context/SKILL.md");

  const references = generateSkillReferences(
    { projectName: manifest.projectName } as any,
    { files: manifest.files.map((f: any) => ({ ...f, sections: [], targetAgents: ["codex"] })) },
    config.outputDir
  );
  for (const [path, content] of Object.entries(references)) {
    writeFileSafe(join(skillDir, path), content);
    logger.success(`Wrote .agents/skills/project-context/${path}`);
  }
}
