import { access } from "node:fs/promises";
import { basename, join } from "node:path";
import { ManifestNotFoundError, ManifestValidationError } from "../errors.js";
import { readJsonFile } from "../utils/json.js";
import { migrateManifest } from "./migrate.js";
import { normalizeManifest } from "./normalize.js";
import type { Framework, Manifest } from "./schema.js";

export type LoadedManifest = {
  manifest: Manifest;
  sharedPath: string;
  localPath: string | undefined;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadManifest(
  cwd: string,
  fallback?: { projectName?: string; framework?: Framework },
): Promise<LoadedManifest> {
  const sharedPath = join(cwd, "ai-workspace.json");
  const localPath = join(cwd, "ai-workspace.local.json");

  if (!(await fileExists(sharedPath))) {
    throw new ManifestNotFoundError(sharedPath);
  }

  let sharedInput: unknown;
  try {
    sharedInput = await readJsonFile<unknown>(sharedPath);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "unknown error";
    throw new ManifestValidationError([`Failed to parse ${sharedPath}: ${reason}`]);
  }

  // Migrate manifest to current schema version if needed
  sharedInput = migrateManifest(sharedInput);

  const localInput = (await fileExists(localPath))
    ? await readJsonFile<unknown>(localPath)
    : undefined;

  return {
    manifest: normalizeManifest(sharedInput, {
      projectName: fallback?.projectName ?? basename(cwd),
      ...(fallback?.framework ? { framework: fallback.framework } : {}),
      ...(localInput === undefined ? {} : { localOverride: localInput }),
    }),
    sharedPath,
    localPath: localInput === undefined ? undefined : localPath,
  };
}
