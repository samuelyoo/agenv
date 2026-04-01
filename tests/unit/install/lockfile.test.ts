import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  computeManifestHash,
  computeContentHash,
  buildLockfile,
  isLockfileStale,
  readLockfile,
  writeLockfile,
} from "../../../src/install/lockfile.js";
import { webAppManifest } from "../../fixtures/manifests.js";
import type { LoadedPack } from "../../../src/packs/load.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "agenv-lockfile-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("computeManifestHash", () => {
  it("returns same hash for same manifest", () => {
    const manifest = webAppManifest();
    const hash1 = computeManifestHash(manifest);
    const hash2 = computeManifestHash(manifest);
    expect(hash1).toBe(hash2);
  });

  it("returns different hash for different manifest", () => {
    const manifest1 = webAppManifest();
    const manifest2 = webAppManifest({ name: "different-name" });
    const hash1 = computeManifestHash(manifest1);
    const hash2 = computeManifestHash(manifest2);
    expect(hash1).not.toBe(hash2);
  });

  it("returns a hex string", () => {
    const manifest = webAppManifest();
    const hash = computeManifestHash(manifest);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("computeContentHash", () => {
  it("returns deterministic hash for pack definition", () => {
    const def = {
      id: "test",
      name: "Test",
      description: "Test pack",
      version: "1.0.0",
      source: "builtin" as const,
      manifest: {
        instructions: { codingStyle: ["Use strict mode."] },
      },
    };
    const hash1 = computeContentHash(def);
    const hash2 = computeContentHash(def);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("buildLockfile", () => {
  it("produces valid lockfile structure", () => {
    const manifest = webAppManifest();
    const loadedPacks: LoadedPack[] = [
      {
        ref: { source: "builtin", id: "test" },
        definition: {
          id: "test",
          name: "Test",
          description: "Test pack",
          version: "1.0.0",
          source: "builtin",
          manifest: {},
        },
      },
    ];

    const lockfile = buildLockfile(manifest, loadedPacks);
    expect(lockfile.schemaVersion).toBe("1");
    expect(lockfile.generatedAt).toBeTruthy();
    expect(lockfile.manifestHash).toMatch(/^[0-9a-f]{64}$/);
    expect(lockfile.packs).toHaveLength(1);
    expect(lockfile.packs[0].id).toBe("test");
    expect(lockfile.packs[0].contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces empty packs array when no packs", () => {
    const manifest = webAppManifest();
    const lockfile = buildLockfile(manifest, []);
    expect(lockfile.packs).toHaveLength(0);
  });
});

describe("isLockfileStale", () => {
  it("returns false when hashes match", () => {
    const manifest = webAppManifest();
    const lockfile = buildLockfile(manifest, []);
    expect(isLockfileStale(manifest, lockfile)).toBe(false);
  });

  it("returns true when manifest has changed", () => {
    const manifest1 = webAppManifest();
    const lockfile = buildLockfile(manifest1, []);
    const manifest2 = webAppManifest({ name: "changed" });
    expect(isLockfileStale(manifest2, lockfile)).toBe(true);
  });
});

describe("readLockfile / writeLockfile", () => {
  it("returns undefined for missing file", async () => {
    const result = await readLockfile(tempDir);
    expect(result).toBeUndefined();
  });

  it("writes and reads back a lockfile", async () => {
    const manifest = webAppManifest();
    const lockfile = buildLockfile(manifest, []);
    const path = await writeLockfile(tempDir, lockfile);
    expect(path).toContain("ai-workspace.lock");

    const read = await readLockfile(tempDir);
    expect(read).toBeDefined();
    expect(read!.schemaVersion).toBe(lockfile.schemaVersion);
    expect(read!.manifestHash).toBe(lockfile.manifestHash);
    expect(read!.packs).toEqual(lockfile.packs);
  });
});
