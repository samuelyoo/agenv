import type { Lockfile } from "../install/lockfile.js";
import { getCatalogEntry } from "../catalog/index.js";

export type OutdatedEntry = {
  id: string;
  currentVersion: string;
  latestVersion: string;
};

export function checkOutdated(lockfile: Lockfile): OutdatedEntry[] {
  const outdated: OutdatedEntry[] = [];

  for (const pack of lockfile.packs) {
    const entry = getCatalogEntry(pack.id);
    if (entry === undefined) {
      continue;
    }
    if (entry.version !== pack.version) {
      outdated.push({
        id: pack.id,
        currentVersion: pack.version,
        latestVersion: entry.version,
      });
    }
  }

  return outdated;
}
