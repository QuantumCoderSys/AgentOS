import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { ManifestSchema, type Manifest } from "../generation/schemas.js";

export function validateManifest(manifest: unknown): string[] {
  const parsed = ManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    return parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
  }
  return [];
}

export function readManifest(cwd: string): Manifest | null {
  const path = join(cwd, ".agentos", "manifest.json");
  if (!existsSync(path)) return null;
  try {
    const data = JSON.parse(readFileSync(path, "utf-8"));
    const errors = validateManifest(data);
    if (errors.length > 0) return null;
    return data as Manifest;
  } catch {
    return null;
  }
}
