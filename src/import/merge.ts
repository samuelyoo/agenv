import { frameworkSchema, type Framework, type Manifest } from "../manifest/schema.js";
import type { ImportFinding } from "./index.js";

export type ImportableFields = {
  targets: Partial<Manifest["targets"]>;
  projectName: string | undefined;
  framework: Framework | undefined;
};

const CONFIDENCE_RANK: Record<"high" | "medium" | "low", number> = {
  high: 3,
  medium: 2,
  low: 1,
};

type TargetKey = keyof Manifest["targets"];

const TARGET_FIELDS: TargetKey[] = [
  "codex",
  "claude",
  "cursor",
  "windsurf",
  "copilot",
  "mcp",
];

export function mergeFindings(findings: ImportFinding[]): ImportableFields {
  const targets: Partial<Manifest["targets"]> = {};

  // Targets: only high-confidence findings are applied
  for (const field of TARGET_FIELDS) {
    const key = `targets.${field}` as const;
    const highFindings = findings.filter((f) => f.field === key && f.confidence === "high");
    if (highFindings.length > 0) {
      targets[field] = true;
    }
  }

  // project.name: highest-confidence wins; tie between highs with different values → undefined
  const projectName = resolveStringField(findings, "project.name");

  // project.framework: same conflict resolution, validated against schema
  const rawFramework = resolveStringField(findings, "project.framework");
  let framework: Framework | undefined;
  if (rawFramework !== undefined) {
    const parsed = frameworkSchema.safeParse(rawFramework);
    framework = parsed.success ? parsed.data : undefined;
  }

  return { targets, projectName, framework };
}

function resolveStringField(
  findings: ImportFinding[],
  field: string,
): string | undefined {
  const relevant = findings
    .filter((f) => f.field === field)
    .sort((a, b) => CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence]);

  if (relevant.length === 0) {
    return undefined;
  }

  const first = relevant[0];
  if (first === undefined) {
    return undefined;
  }

  const topConfidence = first.confidence;
  const topFindings = relevant.filter((f) => f.confidence === topConfidence);

  // Conflict: multiple sources at top confidence with different values
  const uniqueValues = new Set(topFindings.map((f) => f.value));
  if (uniqueValues.size > 1) {
    return undefined;
  }

  return typeof first.value === "string" ? first.value : undefined;
}
