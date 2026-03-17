import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { RenderedFile } from "../adapters/types.js";
import { canHaveGeneratedHeader, hasGeneratedHeader } from "./headers.js";

export type WriteSummary = {
  created: string[];
  updated: string[];
  unchanged: string[];
  skipped: string[];
};

async function tryReadFile(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

export async function writeRenderedFiles(
  cwd: string,
  renderedFiles: RenderedFile[],
): Promise<WriteSummary> {
  const summary: WriteSummary = {
    created: [],
    updated: [],
    unchanged: [],
    skipped: [],
  };

  for (const renderedFile of renderedFiles) {
    const absolutePath = join(cwd, renderedFile.path);
    const existingContent = await tryReadFile(absolutePath);

    if (existingContent === undefined) {
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, renderedFile.content, "utf8");
      summary.created.push(renderedFile.path);
      continue;
    }

    if (existingContent === renderedFile.content) {
      summary.unchanged.push(renderedFile.path);
      continue;
    }

    if (canHaveGeneratedHeader(renderedFile.path) && !hasGeneratedHeader(renderedFile.path, existingContent)) {
      summary.skipped.push(renderedFile.path);
      continue;
    }

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, renderedFile.content, "utf8");
    summary.updated.push(renderedFile.path);
  }

  return summary;
}
