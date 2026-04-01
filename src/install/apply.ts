import { loadManifest } from "../manifest/load.js";
import { loadPacks } from "../packs/load.js";
import { resolvePacks, type ResolveResult } from "../packs/resolve.js";
import { buildLockfile, readLockfile, writeLockfile } from "./lockfile.js";
import { buildInstallPlan, type InstallPlan } from "./plan.js";

export type InstallResult = {
  lockfilePath: string;
  plan: InstallPlan;
  resolveResult: ResolveResult;
};

export async function runInstall(
  cwd: string,
  options?: { dryRun?: boolean },
): Promise<InstallResult> {
  const { manifest } = await loadManifest(cwd);

  const refs = manifest.packs ?? [];

  const { loaded, errors } = await loadPacks(cwd, refs);
  if (errors.length > 0) {
    throw new Error(`Pack loading errors:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  }

  const existingLockfile = await readLockfile(cwd);
  const plan = buildInstallPlan(loaded, existingLockfile);
  const resolveResult = resolvePacks(manifest, loaded);
  const lockfile = buildLockfile(manifest, loaded);

  const lockfilePath = options?.dryRun === true
    ? `${cwd}/ai-workspace.lock`
    : await writeLockfile(cwd, lockfile);

  return {
    lockfilePath,
    plan,
    resolveResult,
  };
}
