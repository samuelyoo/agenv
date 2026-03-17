import type { GenerationPlan } from "../planner/build-plan.js";

export async function writePlannedFiles(_plan: GenerationPlan): Promise<void> {
  throw new Error("File writing is not implemented yet. Use generate/diff for planning output.");
}
