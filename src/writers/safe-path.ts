import { resolve, relative, sep } from "path";
import { UnsafePathError } from "../utils/errors.js";

const FORBIDDEN_PATTERNS = [
  "..",
  "~",
  ".env",
  ".ssh",
  ".gitconfig",
  ".npmrc",
  ".pypirc",
  ".netrc",
];

export function assertSafePath(baseDir: string, targetPath: string): string {
  const resolved = resolve(baseDir, targetPath);
  const rel = relative(baseDir, resolved);

  if (rel.startsWith("..") || rel === "" || resolved === baseDir) {
    throw new UnsafePathError(targetPath);
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (resolved.includes(sep + pattern) || resolved.includes(pattern + sep)) {
      throw new UnsafePathError(targetPath);
    }
  }

  return resolved;
}
