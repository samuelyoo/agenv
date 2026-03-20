import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { RenderedFile } from "../adapters/types.js";
import { canHaveGeneratedHeader, hasGeneratedHeader } from "./headers.js";
import { createBackup } from "./backups.js";

export type WriteSummary = {
  created: string[];
  updated: string[];
  unchanged: string[];
  skipped: string[];
  backedUp: string[];
};

export type WriteOptions = {
  force?: boolean | undefined;
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
  options?: WriteOptions,
): Promise<WriteSummary> {
  const summary: WriteSummary = {
    created: [],
    updated: [],
    unchanged: [],
    skipped: [],
    backedUp: [],
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

    const isUserModified =
      canHaveGeneratedHeader(renderedFile.path) &&
      !hasGeneratedHeader(renderedFile.path, existingContent);

    if (isUserModified && !options?.force) {
      summary.skipped.push(renderedFile.path);
      continue;
    }

    // Back up before overwriting
    const backupPath = await createBackup(cwd, renderedFile.path);
    if (backupPath !== undefined) {
      summary.backedUp.push(renderedFile.path);
    }

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, renderedFile.content, "utf8");
    summary.updated.push(renderedFile.path);
  }

  return summary;
}
