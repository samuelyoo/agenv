import type { Manifest } from "../manifest/schema.js";
import type { GenerationPlan, PlannedFile } from "../planner/build-plan.js";

export type AdapterId = "codex" | "copilot" | "claude" | "mcp";

export type SupportIssue = {
  severity: "warning" | "error";
  code: string;
  message: string;
};

export type SupportResult = {
  supported: boolean;
  issues: SupportIssue[];
};

export type RenderedFile = {
  path: string;
  content: string;
  trustSensitive: boolean;
};

export interface Adapter {
  id: AdapterId;
  supports(manifest: Manifest): SupportResult;
  plan(manifest: Manifest, plan: GenerationPlan): PlannedFile[];
  render(file: PlannedFile, manifest: Manifest): RenderedFile;
}
