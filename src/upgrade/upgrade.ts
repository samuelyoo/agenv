import type { Lockfile } from "../install/lockfile.js";
import { checkOutdated } from "./outdated.js";
import { getCatalogEntry } from "../catalog/index.js";
import { computeContentHash } from "../install/lockfile.js";

export type UpgradeItem = {
  id: string;
  fromVersion: string;
  toVersion: string;
};

export type UpgradePlan = {
  upgrades: UpgradeItem[];
  summary: string;
};

export function planUpgrade(lockfile: Lockfile, packId?: string): UpgradePlan {
  const outdated = checkOutdated(lockfile);
  const filtered = packId !== undefined
    ? outdated.filter((e) => e.id === packId)
    : outdated;

  if (filtered.length === 0) {
    return { upgrades: [], summary: "All packs are up to date." };
  }

  const upgrades: UpgradeItem[] = filtered.map((e) => ({
    id: e.id,
    fromVersion: e.currentVersion,
    toVersion: e.latestVersion,
  }));

  const lines = upgrades.map(
    (u) => `  ${u.id}: ${u.fromVersion} → ${u.toVersion}`,
  );
  const summary = `${upgrades.length} pack(s) to upgrade:\n${lines.join("\n")}`;

  return { upgrades, summary };
}

export function applyUpgrade(lockfile: Lockfile, plan: UpgradePlan): Lockfile {
  const upgradeMap = new Map(plan.upgrades.map((u) => [u.id, u.toVersion]));

  const updatedPacks = lockfile.packs.map((pack) => {
    const newVersion = upgradeMap.get(pack.id);
    if (newVersion === undefined) {
      return pack;
    }
    const entry = getCatalogEntry(pack.id);
    const newHash = entry !== undefined
      ? computeContentHash(entry.definition)
      : pack.contentHash;
    return { ...pack, version: newVersion, contentHash: newHash };
  });

  return {
    ...lockfile,
    generatedAt: new Date().toISOString(),
    packs: updatedPacks,
  };
}
