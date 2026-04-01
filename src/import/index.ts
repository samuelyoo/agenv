import { detectClaude } from "./detectors/claude.js";
import { detectCodex } from "./detectors/codex.js";
import { detectCopilot } from "./detectors/copilot.js";
import { detectCursor } from "./detectors/cursor.js";
import { detectMcp } from "./detectors/mcp.js";
import { detectWindsurf } from "./detectors/windsurf.js";
import { mergeFindings, type ImportableFields } from "./merge.js";
import type { Framework, Manifest } from "../manifest/schema.js";

export type ImportSource = "codex" | "claude" | "cursor" | "windsurf" | "copilot" | "mcp";

export type ImportFinding = {
  source: ImportSource;
  path: string;
  field: string;
  confidence: "high" | "medium" | "low";
  value: unknown;
  note?: string;
};

export type ImportUnsupported = {
  source: ImportSource;
  path: string;
  reason: string;
};

export type DetectorResult = {
  findings: ImportFinding[];
  warnings: string[];
  unsupported: ImportUnsupported[];
};

export type ImportReport = {
  findings: ImportFinding[];
  warnings: string[];
  unsupported: ImportUnsupported[];
};

export type RunImportOptions = {
  from?: ImportSource[];
};

export type RunImportResult = {
  report: ImportReport;
  candidateTargets: Partial<Manifest["targets"]>;
  candidateProjectName: string | undefined;
  candidateFramework: Framework | undefined;
};

export const IMPORT_SOURCES: readonly ImportSource[] = [
  "codex",
  "claude",
  "cursor",
  "windsurf",
  "copilot",
  "mcp",
];

type DetectorFn = (cwd: string) => Promise<DetectorResult>;

const DETECTORS: Record<ImportSource, DetectorFn> = {
  codex: detectCodex,
  claude: detectClaude,
  cursor: detectCursor,
  windsurf: detectWindsurf,
  copilot: detectCopilot,
  mcp: detectMcp,
};

export async function runImport(
  cwd: string,
  options: RunImportOptions = {},
): Promise<RunImportResult> {
  const sources =
    options.from && options.from.length > 0 ? options.from : [...IMPORT_SOURCES];

  const results = await Promise.all(sources.map((source) => DETECTORS[source](cwd)));

  const report: ImportReport = {
    findings: results.flatMap((r) => r.findings),
    warnings: results.flatMap((r) => r.warnings),
    unsupported: results.flatMap((r) => r.unsupported),
  };

  const merged: ImportableFields = mergeFindings(report.findings);

  return {
    report,
    candidateTargets: merged.targets,
    candidateProjectName: merged.projectName,
    candidateFramework: merged.framework,
  };
}
