import { createHash } from "node:crypto";
import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import type { Manifest } from "../manifest/schema.js";
import type { LoadedPack } from "../packs/load.js";
import type { PackDefinition } from "../packs/schema.js";

export type LockfilePack = {
  id: string;
  source: "builtin" | "local" | "github";
  version: string;
  resolvedPath?: string;
  contentHash: string;
  sourceUrl?: string;
  publisher?: string;
};

export type Lockfile = {
  schemaVersion: string;
  generatedAt: string;
  manifestHash: string;
  packs: LockfilePack[];
};

export const LOCKFILE_NAME = "ai-workspace.lock";
export const LOCKFILE_SCHEMA_VERSION = "1";

export function computeManifestHash(manifest: Manifest): string {
  const content = JSON.stringify(manifest);
  return createHash("sha256").update(content).digest("hex");
}

export function computeContentHash(definition: PackDefinition): string {
  const content = JSON.stringify(definition.manifest);
  return createHash("sha256").update(content).digest("hex");
}

export function buildLockfile(
  manifest: Manifest,
  loadedPacks: LoadedPack[],
): Lockfile {
  return {
    schemaVersion: LOCKFILE_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    manifestHash: computeManifestHash(manifest),
    packs: loadedPacks.map((lp) => ({
      id: lp.definition.id,
      source: lp.definition.source,
      version: lp.definition.version,
      ...(lp.ref.path !== undefined ? { resolvedPath: lp.ref.path } : {}),
      contentHash: computeContentHash(lp.definition),
    })),
  };
}

export async function readLockfile(cwd: string): Promise<Lockfile | undefined> {
  const lockfilePath = join(cwd, LOCKFILE_NAME);
  try {
    const content = await readFile(lockfilePath, "utf8");
    return JSON.parse(content) as Lockfile;
  } catch {
    return undefined;
  }
}

export async function writeLockfile(cwd: string, lockfile: Lockfile): Promise<string> {
  const lockfilePath = join(cwd, LOCKFILE_NAME);
  const content = JSON.stringify(lockfile, null, 2) + "\n";
  await writeFile(lockfilePath, content, "utf8");
  return lockfilePath;
}

export function isLockfileStale(manifest: Manifest, lockfile: Lockfile): boolean {
  return computeManifestHash(manifest) !== lockfile.manifestHash;
}
