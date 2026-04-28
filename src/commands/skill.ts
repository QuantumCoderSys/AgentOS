import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { loadConfig } from "../utils/config.js";
import { logger } from "../utils/logger.js";
import { writeFileSafe } from "../utils/fs.js";
import { readManifest } from "../validators/manifest.js";
import { generateSkill, generateSkillReferences } from "../skill/generate-skill.js";
import { validateSkillDir } from "../skill/validate-skill.js";

interface SkillOptions {
  codexPlugin?: boolean;
  name?: string;
  output?: string;
}

export async function skillCommand(options: SkillOptions) {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  const manifest = readManifest(cwd);

  if (!manifest) {
    logger.error("No AgentOS manifest found. Run `agentos init` first.");
    process.exit(1);
  }

  const name = options.name || "project-context";
  const outputDir = options.output || ".agents/skills";
  const skillDir = join(cwd, outputDir, name);

  if (!existsSync(skillDir)) mkdirSync(skillDir, { recursive: true });

  const profile = { projectName: manifest.projectName } as any;
  const artifactPlan = { files: manifest.files.map((f: any) => ({ ...f, sections: [], targetAgents: ["codex"] })) };

  const skillContent = generateSkill(profile, artifactPlan, config.outputDir, name);
  writeFileSafe(join(skillDir, "SKILL.md"), skillContent);
  logger.success(`Wrote ${join(outputDir, name, "SKILL.md")}`);

  const references = generateSkillReferences(profile, artifactPlan, config.outputDir);
  for (const [path, content] of Object.entries(references)) {
    writeFileSafe(join(skillDir, path), content);
    logger.success(`Wrote ${join(outputDir, name, path)}`);
  }

  const validation = validateSkillDir(skillDir);
  if (!validation.valid) {
    validation.errors.forEach((error) => logger.error(error));
    process.exit(1);
  }
  logger.success("Skill validation passed");

  if (options.codexPlugin) {
    const pluginDir = join(cwd, ".codex-plugin");
    if (!existsSync(pluginDir)) mkdirSync(pluginDir, { recursive: true });

    const pluginJson = {
      name: manifest.projectName,
      version: "0.1.0",
      description: `AgentOS-generated skill for ${manifest.projectName}`,
      license: "MIT",
      skills: `./${outputDir}/`,
      interface: {
        displayName: manifest.projectName,
        shortDescription: "Project context skill",
        category: "Development",
      },
    };
    writeFileSafe(join(pluginDir, "plugin.json"), JSON.stringify(pluginJson, null, 2));
    logger.success("Wrote .codex-plugin/plugin.json");
  }

  logger.info(`In Codex, ask: Use $${name} to understand this project before implementing anything.`);
}
