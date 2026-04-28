import { z } from "zod";

export const ProjectProfileSchema = z.object({
  projectName: z.string().min(1),
  projectKind: z.string().min(1),
  targetUsers: z.array(z.string()).min(1),
  problem: z.string().min(1),
  proposedSolution: z.string().min(1),
  platforms: z.array(z.string()),
  knownStack: z.array(z.string()),
  constraints: z.array(z.string()),
  nonGoals: z.array(z.string()),
  risks: z.array(z.string()),
  unknowns: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  followUpQuestions: z.array(z.string()),
});

export type ProjectProfile = z.infer<typeof ProjectProfileSchema>;

export const ArtifactPlanFileSchema = z.object({
  path: z.string().min(1),
  purpose: z.string().min(1),
  sections: z.array(z.string()),
  priority: z.enum(["required", "recommended", "optional"]),
  targetAgents: z.array(z.enum(["codex", "cursor", "generic"])),
});

export const ArtifactPlanSchema = z.object({
  files: z.array(ArtifactPlanFileSchema),
});

export type ArtifactPlan = z.infer<typeof ArtifactPlanSchema>;

export const ReviewResultSchema = z.object({
  fixes: z.array(
    z.object({
      file: z.string(),
      issue: z.string(),
      suggestion: z.string(),
    })
  ),
  notes: z.array(z.string()),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

export const ManifestSchema = z.object({
  schemaVersion: z.string(),
  generatedAt: z.string(),
  projectName: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      purpose: z.string(),
      priority: z.string(),
    })
  ),
  agentTargets: z.array(z.string()),
  provider: z.string(),
  model: z.string(),
});

export type Manifest = z.infer<typeof ManifestSchema>;
