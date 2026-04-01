import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { RenderedFile } from "../adapters/types.js";
import type { DiagnosticFinding } from "../doctor/types.js";
import { canHaveGeneratedHeader, hasGeneratedHeader } from "../fs/headers.js";
import type { Manifest } from "../manifest/schema.js";
import { buildGenerationPlan } from "../planner/build-plan.js";
import { renderPlanFiles } from "../render/render-plan.js";

export type OwnershipEntry = {
  path: string;
  status: "owned" | "modified" | "missing";
};

export type OwnershipReport = {
  entries: OwnershipEntry[];
  findings: DiagnosticFinding[];
};

async function tryReadFile(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

export async function checkOwnership(
  cwd: string,
  manifest: Manifest,
): Promise<OwnershipReport> {
  const plan = buildGenerationPlan(manifest);
  const renderedFiles = renderPlanFiles(manifest, plan);

  const entries: OwnershipEntry[] = [];
  const findings: DiagnosticFinding[] = [];

  for (const file of renderedFiles) {
    const absolutePath = join(cwd, file.path);
    const content = await tryReadFile(absolutePath);

    if (content === undefined) {
      entries.push({ path: file.path, status: "missing" });
      findings.push({
        severity: "info",
        code: "ownership_missing",
        message: `Generated file "${file.path}" does not exist on disk.`,
        path: file.path,
      });
      continue;
    }

    if (canHaveGeneratedHeader(file.path)) {
      if (hasGeneratedHeader(file.path, content)) {
        entries.push({ path: file.path, status: "owned" });
      } else {
        entries.push({ path: file.path, status: "modified" });
        findings.push({
          severity: "warning",
          code: "ownership_modified",
          message: `Generated file "${file.path}" has been modified outside agenv (header missing).`,
          path: file.path,
          remediation: `Run "agenv generate --force" to restore, or "agenv doctor --fix" to re-apply the header.`,
          autofixable: true,
        });
      }
    } else {
      // Files that can't have headers are assumed owned if they exist
      entries.push({ path: file.path, status: "owned" });
    }
  }

  return { entries, findings };
}
