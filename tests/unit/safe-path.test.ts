import { describe, it, expect } from "vitest";
import { assertSafePath, UnsafePathError } from "../../src/writers/safe-path.js";

describe("assertSafePath", () => {
  it("allows safe relative paths", () => {
    const result = assertSafePath("/project", "docs/test.md");
    expect(result).toContain("docs/test.md");
  });

  it("allows safe absolute paths within base", () => {
    const result = assertSafePath("/project", "/project/docs/test.md");
    expect(result).toContain("docs/test.md");
  });

  it("throws on directory traversal", () => {
    expect(() => assertSafePath("/project", "../secret")).toThrow(UnsafePathError);
  });

  it("throws on .env paths", () => {
    expect(() => assertSafePath("/project", "config/.env")).toThrow(UnsafePathError);
  });
});
