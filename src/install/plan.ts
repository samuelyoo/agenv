import type { LoadedPack } from "../packs/load.js";
import { computeContentHash, type Lockfile } from "./lockfile.js";

export type InstallPlanItem = {
  packId: string;
  source: "builtin" | "local" | "github";
  action: "add" | "update" | "unchanged";
};

export type InstallPlan = {
  items: InstallPlanItem[];
  warnings: string[];
};

export function buildInstallPlan(
  loadedPacks: LoadedPack[],
  existingLockfile: Lockfile | undefined,
): InstallPlan {
  const items: InstallPlanItem[] = [];
  const warnings: string[] = [];

  const existingByPackId = new Map<string, string>();
  if (existingLockfile !== undefined) {
    for (const lp of existingLockfile.packs) {
      existingByPackId.set(lp.id, lp.contentHash);
    }
  }

  for (const loaded of loadedPacks) {
    const existingHash = existingByPackId.get(loaded.definition.id);
    const currentHash = computeContentHash(loaded.definition);

    let action: "add" | "update" | "unchanged";
    if (existingHash === undefined) {
      action = "add";
    } else if (existingHash === currentHash) {
      action = "unchanged";
    } else {
      action = "update";
    }

    items.push({
      packId: loaded.definition.id,
      source: loaded.definition.source,
      action,
    });
  }

  return { items, warnings };
}
