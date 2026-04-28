import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { briefCommand } from "./commands/brief.js";
import { refineCommand } from "./commands/refine.js";
import { exportCommand } from "./commands/export.js";
import { skillCommand } from "./commands/skill.js";
import { doctorCommand } from "./commands/doctor.js";
import { configCommand, configSetCommand } from "./commands/config.js";
import { providerTestCommand } from "./commands/provider-test.js";
import { logger } from "./utils/logger.js";

const program = new Command();

program
  .name("agentos")
  .description("AI-powered project setup for coding agents")
  .version("0.1.0");

program
  .command("init [directory]")
  .description("Create a new Project Brain")
  .option("--existing", "Run in existing repository mode")
  .option("--agent <agent>", "Target agent: codex, cursor, generic", "codex")
  .option("--model <model>", "AI model to use")
  .option("--yes", "Skip confirmation prompts")
  .option("--dry-run", "Show what would be written without writing")
  .option("--no-repo-scan", "Skip repository inspection in existing mode")
  .option("--output <dir>", "Output directory for docs", "docs/agentos")
  .option("--from <file>", "Read project idea from file")
  .option("--stdin", "Read project idea from stdin")
  .action(initCommand);

program
  .command("brief")
  .description("Generate docs from a rough text input")
  .option("--from <file>", "Read idea from file")
  .option("--stdin", "Read idea from stdin")
  .option("--interactive", "Run interactive mode")
  .option("--agent <agent>", "Target agent", "codex")
  .option("--yes", "Skip confirmation")
  .option("--dry-run", "Dry run")
  .action(briefCommand);

program
  .command("refine [message]")
  .description("Update generated docs from new constraints")
  .option("--from <file>", "Read update from file")
  .option("--dry-run", "Dry run")
  .option("--yes", "Skip confirmation")
  .action(refineCommand);

program
  .command("export")
  .description("Generate target-specific agent files")
  .option("--target <target>", "Target: codex, cursor, generic")
  .option("--all", "Export all targets")
  .option("--output <dir>", "Output directory")
  .action(exportCommand);

program
  .command("skill")
  .description("Manage project-specific Agent Skills")
  .addCommand(
    new Command("pack")
      .description("Generate a project-specific Agent Skill")
      .option("--codex-plugin", "Create Codex plugin wrapper")
      .option("--name <name>", "Skill name", "project-context")
      .option("--output <dir>", "Output directory", ".agents/skills")
      .action(skillCommand)
  );

program
  .command("doctor")
  .description("Validate installation and outputs")
  .option("--strict", "Run strict validation")
  .action(doctorCommand);

program
  .command("config")
  .description("Manage configuration")
  .addCommand(
    new Command("show").description("Show current config").action(configCommand)
  )
  .addCommand(
    new Command("set <key> <value>")
      .description("Set a config value")
      .action(configSetCommand)
  );

program
  .command("provider")
  .description("Manage AI provider")
  .addCommand(
    new Command("test")
      .description("Validate AI provider connectivity")
      .action(providerTestCommand)
  );

program.parseAsync(process.argv).catch((err) => {
  logger.error("Unexpected error:", err.message);
  process.exit(1);
});
