import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const DEFAULT_IGNORE = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".env",
  ".agentos",
  ".cursor",
  ".codex-plugin",
  ".DS_Store",
  "coverage",
  ".next",
  ".nuxt",
  "out",
];

export interface RepoInspectOptions {
  maxFileBytes: number;
  maxTotalBytes: number;
  ignore: string[];
}

export interface InspectedFile {
  path: string;
  size: number;
  content: string;
}

export function inspectRepo(
  cwd: string,
  options: RepoInspectOptions
): { files: InspectedFile[]; totalSize: number; skipped: string[] } {
  const ignore = new Set([...DEFAULT_IGNORE, ...options.ignore]);
  const files: InspectedFile[] = [];
  const skipped: string[] = [];
  let totalSize = 0;

  function walk(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relative(cwd, fullPath);

      if (ignore.has(entry.name) || ignore.has(relPath)) {
        skipped.push(relPath);
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const stats = statSync(fullPath);
        if (stats.size > options.maxFileBytes) {
          skipped.push(`${relPath} (${stats.size} bytes)`);
          continue;
        }
        if (totalSize + stats.size > options.maxTotalBytes) {
          skipped.push(`${relPath} (would exceed total limit)`);
          continue;
        }
        const content = readFileSync(fullPath, "utf-8");
        files.push({ path: relPath, size: stats.size, content });
        totalSize += stats.size;
      }
    }
  }

  walk(cwd);
  return { files, totalSize, skipped };
}
