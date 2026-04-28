import { describe, expect, it } from "vitest";
import { GenerationPipeline } from "../../src/generation/pipeline.js";
import { MockProvider } from "../../src/provider/mock-provider.js";

describe("GenerationPipeline", () => {
  it("guarantees the required Project Brain files", async () => {
    const pipeline = new GenerationPipeline(new MockProvider());
    const result = await pipeline.run("A CLI for project setup", {});

    const paths = result.artifactPlan.files.map((file) => file.path);

    expect(paths).toContain("docs/agentos/DECISIONS_LOG.md");
    expect(paths).toContain("docs/agentos/GLOSSARY.md");
    expect(result.documents["docs/agentos/DECISIONS_LOG.md"]).toContain("# Decisions Log");
    expect(result.documents["docs/agentos/GLOSSARY.md"]).toContain("# Glossary");
  });
});
