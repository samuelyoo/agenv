import type { GenerationPlan } from "../planner/build-plan.js";

export type DiffSummary = {
  create: string[];
  update: string[];
  unchanged: string[];
  skip: string[];
};

export function summarizePlannedDiff(plan: GenerationPlan): DiffSummary {
  return {
    create: plan.files.map((file) => file.path),
    update: [],
    unchanged: [],
    skip: plan.skipped.map((item) => item.path ?? item.reason),
  };
}
