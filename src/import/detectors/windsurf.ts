import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding } from "../index.js";

export async function detectWindsurf(cwd: string): Promise<DetectorResult> {
  const findings: ImportFinding[] = [];
  const warnings: string[] = [];
  let legacyFound = false;
  let modernFound = false;

  try {
    await stat(join(cwd, ".windsurfrules"));
    legacyFound = true;
  } catch {
    // Not found
  }

  try {
    await stat(join(cwd, ".windsurf", "rules"));
    modernFound = true;
  } catch {
    // Not found
  }

  if (legacyFound || modernFound) {
    findings.push({
      source: "windsurf",
      path: modernFound ? ".windsurf/rules" : ".windsurfrules",
      field: "targets.windsurf",
      confidence: "high",
      value: true,
      ...(legacyFound && modernFound ? { note: "Found modern and legacy Windsurf rules." } : {}),
    });
  }

  if (legacyFound) {
    warnings.push(
      modernFound
        ? "Legacy .windsurfrules is present alongside .windsurf/rules; review precedence before importing."
        : "Legacy .windsurfrules is present; migrate to .windsurf/rules/*.md when practical.",
    );
  }

  return { findings, warnings, unsupported: [] };
}
