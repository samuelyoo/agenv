import { describe, expect, it } from "vitest";
import { checkOutdated, type OutdatedEntry } from "../../../src/upgrade/outdated.js";
import type { Lockfile } from "../../../src/install/lockfile.js";

function makeLockfile(packs: Lockfile["packs"]): Lockfile {
  return {
    schemaVersion: "1",
    generatedAt: new Date().toISOString(),
    manifestHash: "abc123",
    packs,
  };
}

describe("checkOutdated", () => {
  it("reports outdated when catalog has newer version", () => {
    const lockfile = makeLockfile([
      { id: "secure-defaults", source: "builtin", version: "0.9.0", contentHash: "aaa" },
    ]);
    const results = checkOutdated(lockfile);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("secure-defaults");
    expect(results[0].currentVersion).toBe("0.9.0");
    expect(results[0].latestVersion).toBe("1.0.0");
  });

  it("reports up-to-date when versions match", () => {
    const lockfile = makeLockfile([
      { id: "secure-defaults", source: "builtin", version: "1.0.0", contentHash: "aaa" },
    ]);
    const results = checkOutdated(lockfile);
    expect(results.length).toBe(0);
  });

  it("returns empty when lockfile has no packs", () => {
    const lockfile = makeLockfile([]);
    const results = checkOutdated(lockfile);
    expect(results).toEqual([]);
  });

  it("handles packs not in catalog gracefully", () => {
    const lockfile = makeLockfile([
      { id: "unknown-pack", source: "local", version: "1.0.0", contentHash: "bbb" },
    ]);
    const results = checkOutdated(lockfile);
    // Packs not in the catalog are skipped (cannot determine if outdated)
    expect(results).toEqual([]);
  });

  it("flags all outdated packs in multi-pack lockfile", () => {
    const lockfile = makeLockfile([
      { id: "secure-defaults", source: "builtin", version: "0.1.0", contentHash: "aaa" },
      { id: "strict-typescript", source: "builtin", version: "0.5.0", contentHash: "bbb" },
      { id: "testing-essentials", source: "builtin", version: "1.0.0", contentHash: "ccc" },
    ]);
    const results = checkOutdated(lockfile);
    expect(results.length).toBe(2);
    expect(results.map((r) => r.id).sort()).toEqual(["secure-defaults", "strict-typescript"]);
  });
});
