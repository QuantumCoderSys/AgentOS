import type { AIProvider } from "../provider/types.js";
import type { ProjectProfile, ArtifactPlan, ReviewResult } from "./schemas.js";
import {
  intakeNormalizationPrompt,
  artifactPlanPrompt,
  documentGenerationPrompt,
  reviewPrompt,
} from "./prompts.js";
import { logger } from "../utils/logger.js";

export interface GenerationResult {
  profile: ProjectProfile;
  artifactPlan: ArtifactPlan;
  documents: Record<string, string>;
  review: ReviewResult;
}

const REQUIRED_PROJECT_BRAIN_FILES: ArtifactPlan["files"] = [
  {
    path: "docs/agentos/PROJECT_BRIEF.md",
    purpose: "Define the project, users, problem, solution, constraints, non-goals, and agent guidance.",
    sections: [
      "Summary",
      "Target users",
      "Problem",
      "Proposed solution",
      "MVP outcome",
      "Known constraints",
      "Explicit non-goals",
      "Open questions",
      "Agent guidance",
    ],
    priority: "required",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/PRODUCT_REQUIREMENTS.md",
    purpose: "Convert the rough idea into implementation-ready product requirements.",
    sections: [
      "Product overview",
      "Personas",
      "User stories",
      "Functional requirements",
      "Non-functional requirements",
      "MVP scope",
      "Out-of-scope items",
      "Acceptance criteria",
      "Edge cases",
      "Questions for human review",
    ],
    priority: "required",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/ARCHITECTURE.md",
    purpose: "Describe architecture, stack, modules, integrations, risks, and tradeoffs.",
    sections: [
      "Architecture summary",
      "Recommended stack",
      "Data model assumptions",
      "Main modules",
      "Integration points",
      "State management",
      "Error handling",
      "Security considerations",
      "File structure recommendation",
      "Architecture tradeoffs",
      "What not to overbuild",
    ],
    priority: "required",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/IMPLEMENTATION_PLAN.md",
    purpose: "Break implementation into agent-friendly phases and validation checkpoints.",
    sections: [
      "Phase 0: setup and verification",
      "Phase 1: core data model",
      "Phase 2: core user flow",
      "Phase 3: interface and UX",
      "Phase 4: testing and hardening",
      "Phase 5: release readiness",
      "Per-task acceptance criteria",
      "Suggested validation command after each phase",
    ],
    priority: "required",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/AGENT_WORKFLOW.md",
    purpose: "Define how coding agents should plan, implement, validate, and update docs.",
    sections: [
      "Files to read first",
      "How to plan",
      "How to implement",
      "How to validate",
      "How to update docs",
      "When to ask the user",
      "When not to ask and proceed with a safe default",
      "How to log decisions",
    ],
    priority: "required",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/ACCEPTANCE_CRITERIA.md",
    purpose: "List concrete acceptance criteria for the MVP and generated project context.",
    sections: ["Acceptance criteria", "Validation commands", "Definition of done"],
    priority: "required",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/TECH_DECISIONS.md",
    purpose: "Record known technical decisions, constraints, and decision owners.",
    sections: ["Confirmed decisions", "Assumptions", "Decision review triggers"],
    priority: "recommended",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/DESIGN_DIRECTION.md",
    purpose: "Capture product-specific UX, visual, and interaction direction when relevant.",
    sections: ["Audience", "Experience principles", "Interface expectations", "Out-of-scope design choices"],
    priority: "recommended",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/SECURITY_AND_PRIVACY.md",
    purpose: "Document security, privacy, secrets, data handling, and approval constraints.",
    sections: ["Security posture", "Data handling", "Secrets policy", "Privacy risks", "Approval triggers"],
    priority: "required",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/RISK_REGISTER.md",
    purpose: "Track product, technical, security, and execution risks with mitigations.",
    sections: ["Risk register", "Mitigations", "Review cadence"],
    priority: "recommended",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/DECISIONS_LOG.md",
    purpose: "Provide the durable log where future architecture and scope decisions are appended.",
    sections: ["How to use this log", "Initial decisions"],
    priority: "required",
    targetAgents: ["codex", "cursor", "generic"],
  },
  {
    path: "docs/agentos/GLOSSARY.md",
    purpose: "Define project-specific terminology so agents and humans use consistent language.",
    sections: ["Terms", "Domain language", "Ambiguous terms"],
    priority: "recommended",
    targetAgents: ["codex", "cursor", "generic"],
  },
];

const PROFILE_SCHEMA = {
  type: "object",
  properties: {
    projectName: { type: "string" },
    projectKind: { type: "string" },
    targetUsers: { type: "array", items: { type: "string" } },
    problem: { type: "string" },
    proposedSolution: { type: "string" },
    platforms: { type: "array", items: { type: "string" } },
    knownStack: { type: "array", items: { type: "string" } },
    constraints: { type: "array", items: { type: "string" } },
    nonGoals: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    unknowns: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
    followUpQuestions: { type: "array", items: { type: "string" } },
  },
  required: [
    "projectName",
    "projectKind",
    "targetUsers",
    "problem",
    "proposedSolution",
    "platforms",
    "knownStack",
    "constraints",
    "nonGoals",
    "risks",
    "unknowns",
    "confidence",
    "followUpQuestions",
  ],
  additionalProperties: false,
};

const ARTIFACT_SCHEMA = {
  type: "object",
  properties: {
    files: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          purpose: { type: "string" },
          sections: { type: "array", items: { type: "string" } },
          priority: { type: "string", enum: ["required", "recommended", "optional"] },
          targetAgents: {
            type: "array",
            items: { type: "string", enum: ["codex", "cursor", "generic"] },
          },
        },
        required: ["path", "purpose", "sections", "priority", "targetAgents"],
        additionalProperties: false,
      },
    },
  },
  required: ["files"],
  additionalProperties: false,
};

const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    fixes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          file: { type: "string" },
          issue: { type: "string" },
          suggestion: { type: "string" },
        },
        required: ["file", "issue", "suggestion"],
        additionalProperties: false,
      },
    },
    notes: { type: "array", items: { type: "string" } },
  },
  required: ["fixes", "notes"],
  additionalProperties: false,
};

export class GenerationPipeline {
  constructor(private provider: AIProvider) {}

  async run(
    rawIdea: string,
    answers: Record<string, string>,
    repoSummary?: string
  ): Promise<GenerationResult> {
    logger.info("Pass 1: Intake normalization");
    const profile = await this.pass1NormalizeIntake(rawIdea, answers, repoSummary);
    logger.info(`Project: ${profile.projectName} (${profile.projectKind})`);
    logger.info(`Confidence: ${profile.confidence}`);

    if (profile.confidence < 0.8 && profile.followUpQuestions.length > 0) {
      logger.warn("Low confidence. Consider answering:");
      profile.followUpQuestions.forEach((q) => logger.warn(`  - ${q}`));
    }

    logger.info("Pass 2: Artifact planning");
    const artifactPlan = await this.pass2PlanArtifacts(profile);
    logger.info(`Planned ${artifactPlan.files.length} files`);

    logger.info("Pass 3: Document generation");
    const documents: Record<string, string> = {};
    for (const file of artifactPlan.files) {
      if (file.priority === "optional") continue;
      logger.info(`  Generating ${file.path}...`);
      const content = await this.pass3GenerateDocument(profile, artifactPlan, file);
      documents[file.path] = content;
    }

    logger.info("Pass 4: Review and consistency check");
    const review = await this.pass4Review(profile, documents);
    if (review.fixes.length > 0) {
      logger.warn(`Review found ${review.fixes.length} issues`);
      review.fixes.forEach((f) => logger.warn(`  ${f.file}: ${f.issue}`));
    } else {
      logger.success("Review passed with no fixes needed");
    }

    return { profile, artifactPlan, documents, review };
  }

  private async pass1NormalizeIntake(
    rawIdea: string,
    answers: Record<string, string>,
    repoSummary?: string
  ): Promise<ProjectProfile> {
    const prompt = intakeNormalizationPrompt(rawIdea, answers, repoSummary);
    return this.provider.generateStructured<ProjectProfile>({
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      schema: PROFILE_SCHEMA,
      temperature: 0.3,
    });
  }

  private async pass2PlanArtifacts(profile: ProjectProfile): Promise<ArtifactPlan> {
    const prompt = artifactPlanPrompt(JSON.stringify(profile, null, 2));
    const plan = await this.provider.generateStructured<ArtifactPlan>({
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      schema: ARTIFACT_SCHEMA,
      temperature: 0.2,
    });
    return withRequiredProjectBrainFiles(plan);
  }

  private async pass3GenerateDocument(
    profile: ProjectProfile,
    artifactPlan: ArtifactPlan,
    file: ArtifactPlan["files"][number]
  ): Promise<string> {
    const prompt = documentGenerationPrompt(
      JSON.stringify(profile, null, 2),
      JSON.stringify(artifactPlan, null, 2),
      file.path,
      file.purpose,
      file.sections
    );
    return this.provider.generateText({
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      temperature: 0.4,
    });
  }

  private async pass4Review(
    profile: ProjectProfile,
    documents: Record<string, string>
  ): Promise<ReviewResult> {
    const docsString = Object.entries(documents)
      .map(([path, content]) => `--- ${path} ---\n${content.slice(0, 2000)}`)
      .join("\n\n");
    const prompt = reviewPrompt(JSON.stringify(profile, null, 2), docsString);
    return this.provider.generateStructured<ReviewResult>({
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      schema: REVIEW_SCHEMA,
      temperature: 0.2,
    });
  }
}

function withRequiredProjectBrainFiles(plan: ArtifactPlan): ArtifactPlan {
  const byPath = new Map(plan.files.map((file) => [file.path, file]));

  for (const requiredFile of REQUIRED_PROJECT_BRAIN_FILES) {
    if (!byPath.has(requiredFile.path)) {
      byPath.set(requiredFile.path, requiredFile);
      continue;
    }

    const existing = byPath.get(requiredFile.path)!;
    byPath.set(requiredFile.path, {
      ...requiredFile,
      ...existing,
      sections: existing.sections.length > 0 ? existing.sections : requiredFile.sections,
      targetAgents:
        existing.targetAgents.length > 0 ? existing.targetAgents : requiredFile.targetAgents,
      priority:
        requiredFile.priority === "required" ? "required" : existing.priority,
    });
  }

  return { files: Array.from(byPath.values()) };
}
