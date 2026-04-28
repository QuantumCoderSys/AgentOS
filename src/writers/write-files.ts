import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { assertSafePath } from "./safe-path.js";
import { logger } from "../utils/logger.js";

export interface WritePlan {
  path: string;
  content: string;
  purpose: string;
}

export interface WriteResult {
  path: string;
  written: boolean;
  existing: boolean;
  dryRun: boolean;
}

export function createWritePlan(
  _baseDir: string,
  documents: Record<string, string>,
  artifactPlan: { files: Array<{ path: string; purpose: string }> }
): WritePlan[] {
  const plans: WritePlan[] = [];
  for (const [path, content] of Object.entries(documents)) {
    const info = artifactPlan.files.find((f) => f.path === path);
    plans.push({ path, content, purpose: info?.purpose || "generated document" });
  }
  return plans;
}

export function executeWritePlan(
  baseDir: string,
  plans: WritePlan[],
  dryRun: boolean = false
): WriteResult[] {
  const results: WriteResult[] = [];
  for (const plan of plans) {
    try {
      const safePath = assertSafePath(baseDir, plan.path);
      const existing = existsSync(safePath);

      if (dryRun) {
        results.push({ path: plan.path, written: false, existing, dryRun: true });
        continue;
      }

      const dir = dirname(safePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      writeFileSync(safePath, plan.content, "utf-8");
      results.push({ path: plan.path, written: true, existing, dryRun: false });
    } catch (err) {
      logger.error(`Failed to write ${plan.path}: ${(err as Error).message}`);
      results.push({ path: plan.path, written: false, existing: false, dryRun });
    }
  }
  return results;
}

export function previewPlan(plans: WritePlan[]): void {
  logger.heading("Files to write:");
  for (const plan of plans) {
    const existing = existsSync(plan.path) ? " [OVERWRITE]" : " [NEW]";
    logger.info(`${plan.path}${existing}`);
    logger.info(`  Purpose: ${plan.purpose}`);
  }
}
