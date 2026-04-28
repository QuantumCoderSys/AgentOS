import { existsSync, readFileSync } from "fs";

export interface SkillValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSkill(skillPath: string): SkillValidationResult {
  const errors: string[] = [];

  if (!existsSync(skillPath)) {
    return { valid: false, errors: [`Skill file not found: ${skillPath}`] };
  }

  const content = readFileSync(skillPath, "utf-8");

  if (!content.startsWith("---")) {
    errors.push("Missing YAML frontmatter");
  }

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push("Invalid frontmatter format");
  } else {
    const fm = frontmatterMatch[1];
    if (!/name:\s*\S+/.test(fm)) errors.push("Missing 'name' in frontmatter");
    if (!/description:\s*\S+/.test(fm)) errors.push("Missing 'description' in frontmatter");

    const nameMatch = fm.match(/name:\s*(.+)/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      if (!/^[a-z0-9-]+$/.test(name)) {
        errors.push("Skill name must be lowercase kebab-case");
      }
    }
  }

  if (!content.includes("Instructions") && !content.includes("##")) {
    errors.push("Skill body missing clear instructions");
  }

  return { valid: errors.length === 0, errors };
}

export function validateSkillDir(skillDir: string): SkillValidationResult {
  const skillMd = `${skillDir}/SKILL.md`;
  return validateSkill(skillMd);
}
