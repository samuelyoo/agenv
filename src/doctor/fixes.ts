import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { applyGeneratedHeader, canHaveGeneratedHeader } from "../fs/headers.js";
import type { DiagnosticFinding } from "./types.js";

export type FixResult = {
  code: string;
  applied: boolean;
  message: string;
};

const FIXABLE_CODES = new Set(["local_override_missing", "ownership_modified"]);

export async function applyFixes(
  cwd: string,
  findings: DiagnosticFinding[],
): Promise<FixResult[]> {
  const fixable = findings.filter(
    (f) => f.autofixable && FIXABLE_CODES.has(f.code),
  );

  const results: FixResult[] = [];

  for (const finding of fixable) {
    switch (finding.code) {
      case "local_override_missing":
        results.push(await fixLocalOverride(cwd, finding));
        break;
      case "ownership_modified":
        results.push(await fixOwnershipHeader(cwd, finding));
        break;
    }
  }

  return results;
}

async function fixLocalOverride(
  cwd: string,
  finding: DiagnosticFinding,
): Promise<FixResult> {
  const filePath = join(cwd, "ai-workspace.local.json");
  try {
    await readFile(filePath, "utf8");
    return {
      code: finding.code,
      applied: false,
      message: "File already exists, skipping.",
    };
  } catch {
    await writeFile(filePath, "{}\n", "utf8");
    return {
      code: finding.code,
      applied: true,
      message: "Created empty ai-workspace.local.json.",
    };
  }
}

async function fixOwnershipHeader(
  cwd: string,
  finding: DiagnosticFinding,
): Promise<FixResult> {
  if (!finding.path) {
    return {
      code: finding.code,
      applied: false,
      message: "No path specified for ownership fix.",
    };
  }

  const filePath = join(cwd, finding.path);

  if (!canHaveGeneratedHeader(finding.path)) {
    return {
      code: finding.code,
      applied: false,
      message: `Cannot apply header to ${finding.path}.`,
    };
  }

  try {
    const content = await readFile(filePath, "utf8");
    const patched = applyGeneratedHeader(finding.path, content);
    await writeFile(filePath, patched, "utf8");
    return {
      code: finding.code,
      applied: true,
      message: `Re-applied generated header to ${finding.path}.`,
    };
  } catch {
    return {
      code: finding.code,
      applied: false,
      message: `Could not read ${finding.path}.`,
    };
  }
}
