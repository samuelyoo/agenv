import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding } from "../index.js";

export async function detectCursor(cwd: string): Promise<DetectorResult> {
  const findings: ImportFinding[] = [];
  const warnings: string[] = [];
  let legacyFound = false;
  let modernFound = false;

  try {
    await stat(join(cwd, ".cursorrules"));
    legacyFound = true;
  } catch {
    // Not found
  }

  try {
    await stat(join(cwd, ".cursor", "rules"));
    modernFound = true;
  } catch {
    // Not found
  }

  if (legacyFound || modernFound) {
    findings.push({
      source: "cursor",
      path: modernFound ? ".cursor/rules" : ".cursorrules",
      field: "targets.cursor",
      confidence: "high",
      value: true,
      ...(legacyFound && modernFound ? { note: "Found modern and legacy Cursor rules." } : {}),
    });
  }

  if (legacyFound) {
    warnings.push(
      modernFound
        ? "Legacy .cursorrules is present alongside .cursor/rules; review precedence before importing."
        : "Legacy .cursorrules is present; migrate to .cursor/rules/*.mdc when practical.",
    );
  }

  return { findings, warnings, unsupported: [] };
}
