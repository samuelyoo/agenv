import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { canHaveGeneratedHeader, hasGeneratedHeader } from "./headers.js";
import type { RenderedFile } from "../adapters/types.js";
import type { PlannedFile } from "../planner/build-plan.js";

export type DiffEntry = {
  path: string;
  action: "create" | "update" | "unchanged" | "skip";
  target: string;
  layer: string;
  purpose: string;
};

export type DiffSummary = {
  create: string[];
  update: string[];
  unchanged: string[];
  skip: string[];
  entries: DiffEntry[];
};

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function summarizeRenderedDiff(
  cwd: string,
  renderedFiles: RenderedFile[],
  plannedFiles?: PlannedFile[],
): Promise<DiffSummary> {
  const plannedByPath = new Map<string, PlannedFile>();
  if (plannedFiles) {
    for (const pf of plannedFiles) {
      plannedByPath.set(pf.path, pf);
    }
  }

  const summary: DiffSummary = {
    create: [],
    update: [],
    unchanged: [],
    skip: [],
    entries: [],
  };

  for (const renderedFile of renderedFiles) {
    const absolutePath = join(cwd, renderedFile.path);
    let action: DiffEntry["action"];

    if (!(await pathExists(absolutePath))) {
      summary.create.push(renderedFile.path);
      action = "create";
    } else {
      const existingContent = await readFile(absolutePath, "utf8");

      if (existingContent === renderedFile.content) {
        summary.unchanged.push(renderedFile.path);
        action = "unchanged";
      } else if (canHaveGeneratedHeader(renderedFile.path) && !hasGeneratedHeader(renderedFile.path, existingContent)) {
        summary.skip.push(renderedFile.path);
        action = "skip";
      } else {
        summary.update.push(renderedFile.path);
        action = "update";
      }
    }

    const planned = plannedByPath.get(renderedFile.path);
    summary.entries.push({
      path: renderedFile.path,
      action,
      target: planned?.target ?? "shared",
      layer: planned?.layer ?? "base",
      purpose: planned?.purpose ?? "",
    });
  }

  return summary;
}
