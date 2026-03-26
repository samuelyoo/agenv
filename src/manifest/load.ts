import { access, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { parse as parseYaml } from "yaml";
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

async function findManifestFile(cwd: string): Promise<{ path: string; format: "json" | "yaml" }> {
  const jsonPath = join(cwd, "ai-workspace.json");
  const yamlPath = join(cwd, "ai-workspace.yaml");
  const ymlPath = join(cwd, "ai-workspace.yml");

  if (await fileExists(jsonPath)) return { path: jsonPath, format: "json" };
  if (await fileExists(yamlPath)) return { path: yamlPath, format: "yaml" };
  if (await fileExists(ymlPath)) return { path: ymlPath, format: "yaml" };

  throw new ManifestNotFoundError(jsonPath);
}

async function findLocalOverrideFile(cwd: string): Promise<string | undefined> {
  const candidates = [
    join(cwd, "ai-workspace.local.json"),
    join(cwd, "ai-workspace.local.yaml"),
    join(cwd, "ai-workspace.local.yml"),
  ];
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return undefined;
}

async function parseManifestFile(filePath: string, format: "json" | "yaml"): Promise<unknown> {
  if (format === "json") return readJsonFile<unknown>(filePath);
  const content = await readFile(filePath, "utf-8");
  return parseYaml(content) as unknown;
}

export async function loadManifest(
  cwd: string,
  fallback?: { projectName?: string; framework?: Framework },
): Promise<LoadedManifest> {
  const found = await findManifestFile(cwd);
  const localOverridePath = await findLocalOverrideFile(cwd);

  let sharedInput: unknown;
  try {
    sharedInput = await parseManifestFile(found.path, found.format);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "unknown error";
    throw new ManifestValidationError([`Failed to parse ${found.path}: ${reason}`]);
  }

  // Migrate manifest to current schema version if needed
  sharedInput = migrateManifest(sharedInput);

  let localInput: unknown | undefined;
  if (localOverridePath) {
    const localFormat = localOverridePath.endsWith(".json") ? "json" as const : "yaml" as const;
    try {
      localInput = await parseManifestFile(localOverridePath, localFormat);
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : "unknown error";
      throw new ManifestValidationError([`Failed to parse ${localOverridePath}: ${reason}`]);
    }
  } else {
    localInput = undefined;
  }

  return {
    manifest: normalizeManifest(sharedInput, {
      projectName: fallback?.projectName ?? basename(cwd),
      ...(fallback?.framework ? { framework: fallback.framework } : {}),
      ...(localInput === undefined ? {} : { localOverride: localInput }),
    }),
    sharedPath: found.path,
    localPath: localOverridePath ?? undefined,
  };
}
