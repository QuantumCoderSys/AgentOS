import { existsSync, mkdirSync, writeFileSync, readFileSync, statSync } from "fs";
import { dirname, resolve, relative, isAbsolute } from "path";
import { UnsafePathError } from "../utils/errors.js";

export function ensureDir(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function writeFileSafe(
  absolutePath: string,
  content: string,
  dryRun: boolean = false
): { path: string; written: boolean; existing: boolean } {
  const resolved = resolve(absolutePath);
  const cwd = process.cwd();

  if (!resolved.startsWith(cwd) && !isAbsolute(resolved)) {
    throw new UnsafePathError(resolved);
  }

  const existing = existsSync(resolved);

  if (dryRun) {
    return { path: resolved, written: false, existing };
  }

  ensureDir(resolved);
  writeFileSync(resolved, content, "utf-8");
  return { path: resolved, written: true, existing };
}

export function readFileLimited(path: string, maxBytes: number): string {
  if (!existsSync(path)) return "";
  const stats = statSync(path);
  const size = Math.min(stats.size, maxBytes);
  const fd = readFileSync(path);
  return fd.slice(0, size).toString("utf-8");
}

export function getRelativePath(from: string, to: string): string {
  return relative(from, to) || ".";
}
