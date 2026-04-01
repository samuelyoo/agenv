import { describe, it, expect } from "vitest";
import { buildInstallPlan } from "../../../src/install/plan.js";
import type { LoadedPack } from "../../../src/packs/load.js";
import type { Lockfile } from "../../../src/install/lockfile.js";
import { computeContentHash } from "../../../src/install/lockfile.js";

function makeLoadedPack(id: string): LoadedPack {
  return {
    ref: { source: "builtin", id },
    definition: {
      id,
      name: id,
      description: `Pack ${id}`,
      version: "1.0.0",
      source: "builtin",
      manifest: {
        instructions: { codingStyle: [`Rule from ${id}.`] },
      },
    },
  };
}

describe("buildInstallPlan", () => {
  it("marks all packs as add when no existing lockfile", () => {
    const loaded = [makeLoadedPack("pack-a"), makeLoadedPack("pack-b")];
    const plan = buildInstallPlan(loaded, undefined);
    expect(plan.items).toHaveLength(2);
    expect(plan.items.every((i) => i.action === "add")).toBe(true);
  });

  it("marks pack as unchanged when hash matches", () => {
    const loaded = [makeLoadedPack("pack-a")];
    const existingLockfile: Lockfile = {
      schemaVersion: "1",
      generatedAt: "2025-01-01T00:00:00.000Z",
      manifestHash: "abc123",
      packs: [
        {
          id: "pack-a",
          source: "builtin",
          version: "1.0.0",
          contentHash: computeContentHash(loaded[0].definition),
        },
      ],
    };

    const plan = buildInstallPlan(loaded, existingLockfile);
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0].action).toBe("unchanged");
  });

  it("marks pack as update when hash differs", () => {
    const loaded = [makeLoadedPack("pack-a")];
    const existingLockfile: Lockfile = {
      schemaVersion: "1",
      generatedAt: "2025-01-01T00:00:00.000Z",
      manifestHash: "abc123",
      packs: [
        {
          id: "pack-a",
          source: "builtin",
          version: "1.0.0",
          contentHash: "old-hash-different",
        },
      ],
    };

    const plan = buildInstallPlan(loaded, existingLockfile);
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0].action).toBe("update");
  });

  it("does not include removed packs in plan", () => {
    const loaded: LoadedPack[] = [];
    const existingLockfile: Lockfile = {
      schemaVersion: "1",
      generatedAt: "2025-01-01T00:00:00.000Z",
      manifestHash: "abc123",
      packs: [
        {
          id: "removed-pack",
          source: "builtin",
          version: "1.0.0",
          contentHash: "some-hash",
        },
      ],
    };

    const plan = buildInstallPlan(loaded, existingLockfile);
    expect(plan.items).toHaveLength(0);
  });
});
