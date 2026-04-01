import { describe, expect, it } from "vitest";
import { planUpgrade, applyUpgrade, type UpgradePlan } from "../../../src/upgrade/upgrade.js";
import type { Lockfile } from "../../../src/install/lockfile.js";

function makeLockfile(packs: Lockfile["packs"]): Lockfile {
  return {
    schemaVersion: "1",
    generatedAt: new Date().toISOString(),
    manifestHash: "abc123",
    packs,
  };
}

describe("planUpgrade", () => {
  it("identifies packs to upgrade", () => {
    const lockfile = makeLockfile([
      { id: "secure-defaults", source: "builtin", version: "0.9.0", contentHash: "aaa" },
    ]);
    const plan = planUpgrade(lockfile);
    expect(plan.upgrades.length).toBe(1);
    expect(plan.upgrades[0].id).toBe("secure-defaults");
    expect(plan.upgrades[0].fromVersion).toBe("0.9.0");
    expect(plan.upgrades[0].toVersion).toBe("1.0.0");
  });

  it("produces change summary", () => {
    const lockfile = makeLockfile([
      { id: "secure-defaults", source: "builtin", version: "0.8.0", contentHash: "aaa" },
    ]);
    const plan = planUpgrade(lockfile);
    expect(plan.upgrades.length).toBe(1);
    expect(typeof plan.summary).toBe("string");
    expect(plan.summary.length).toBeGreaterThan(0);
  });

  it("respects specific packId filter", () => {
    const lockfile = makeLockfile([
      { id: "secure-defaults", source: "builtin", version: "0.1.0", contentHash: "aaa" },
      { id: "strict-typescript", source: "builtin", version: "0.1.0", contentHash: "bbb" },
    ]);
    const plan = planUpgrade(lockfile, "strict-typescript");
    expect(plan.upgrades.length).toBe(1);
    expect(plan.upgrades[0].id).toBe("strict-typescript");
  });

  it("returns empty for up-to-date state", () => {
    const lockfile = makeLockfile([
      { id: "secure-defaults", source: "builtin", version: "1.0.0", contentHash: "aaa" },
    ]);
    const plan = planUpgrade(lockfile);
    expect(plan.upgrades).toEqual([]);
    expect(plan.summary).toContain("up to date");
  });
});

describe("applyUpgrade", () => {
  it("updates lockfile versions", () => {
    const lockfile = makeLockfile([
      { id: "secure-defaults", source: "builtin", version: "0.9.0", contentHash: "aaa" },
    ]);
    const plan = planUpgrade(lockfile);
    const updated = applyUpgrade(lockfile, plan);
    const pack = updated.packs.find((p) => p.id === "secure-defaults");
    expect(pack).toBeDefined();
    expect(pack!.version).toBe("1.0.0");
  });
});
