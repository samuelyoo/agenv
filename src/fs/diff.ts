import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { canHaveGeneratedHeader, hasGeneratedHeader } from "./headers.js";
import type { RenderedFile } from "../adapters/types.js";

export type DiffSummary = {
  create: string[];
  update: string[];
  unchanged: string[];
  skip: string[];
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
): Promise<DiffSummary> {
  const summary: DiffSummary = {
    create: [],
    update: [],
    unchanged: [],
    skip: [],
  };

  for (const renderedFile of renderedFiles) {
    const absolutePath = join(cwd, renderedFile.path);

    if (!(await pathExists(absolutePath))) {
      summary.create.push(renderedFile.path);
      continue;
    }

    const existingContent = await readFile(absolutePath, "utf8");

    if (existingContent === renderedFile.content) {
      summary.unchanged.push(renderedFile.path);
      continue;
    }

    if (canHaveGeneratedHeader(renderedFile.path) && !hasGeneratedHeader(renderedFile.path, existingContent)) {
      summary.skip.push(renderedFile.path);
      continue;
    }

    summary.update.push(renderedFile.path);
  }

  return summary;
}
