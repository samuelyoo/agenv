import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runInstall } from "../../src/install/apply.js";
import { readLockfile, isLockfileStale, computeManifestHash } from "../../src/install/lockfile.js";
import { loadManifest } from "../../src/manifest/load.js";
import { buildRecommendedManifest } from "../../src/manifest/defaults.js";
import { formatJson } from "../../src/utils/json.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "agenv-install-integ-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function writeManifest(cwd: string, overrides?: Record<string, unknown>): Promise<void> {
  const manifest = buildRecommendedManifest({
    name: "test-app",
    framework: "nextjs",
    projectType: "web-app",
  });
  const data = { ...manifest, ...overrides };
  return writeFile(join(cwd, "ai-workspace.json"), formatJson(data), "utf8");
}

describe("install integration", () => {
  it("fresh install with one builtin pack writes lockfile", async () => {
    await writeManifest(tempDir, {
      packs: [{ source: "builtin", id: "secure-defaults" }],
    });

    await runInstall(tempDir);

    const lockfile = await readLockfile(tempDir);
    expect(lockfile).toBeDefined();
    expect(lockfile!.packs).toHaveLength(1);
    expect(lockfile!.packs[0].id).toBe("secure-defaults");
    expect(lockfile!.packs[0].source).toBe("builtin");
    expect(lockfile!.packs[0].contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("repeated install produces identical lockfile hashes", async () => {
    await writeManifest(tempDir, {
      packs: [{ source: "builtin", id: "secure-defaults" }],
    });

    await runInstall(tempDir);
    const lockfile1 = await readLockfile(tempDir);

    await runInstall(tempDir);
    const lockfile2 = await readLockfile(tempDir);

    expect(lockfile1).toBeDefined();
    expect(lockfile2).toBeDefined();
    expect(lockfile1!.manifestHash).toBe(lockfile2!.manifestHash);
    expect(lockfile1!.packs).toEqual(lockfile2!.packs);
    expect(lockfile1!.schemaVersion).toBe(lockfile2!.schemaVersion);
  });

  it("stale lockfile detected after manifest change", async () => {
    await writeManifest(tempDir, {
      packs: [{ source: "builtin", id: "secure-defaults" }],
    });

    await runInstall(tempDir);
    const lockfile = await readLockfile(tempDir);
    expect(lockfile).toBeDefined();

    // Change the manifest
    await writeManifest(tempDir, {
      packs: [{ source: "builtin", id: "secure-defaults" }],
      project: {
        name: "changed-name",
        type: "web-app",
        framework: "nextjs",
        language: "ts",
      },
    });

    const { manifest: updatedManifest } = await loadManifest(tempDir);
    expect(isLockfileStale(updatedManifest, lockfile!)).toBe(true);
  });

  it("local pack install from subdirectory", async () => {
    // Create local pack
    const packDir = join(tempDir, "packs", "my-local");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "pack.json"),
      JSON.stringify({
        id: "my-local",
        name: "My Local Pack",
        description: "A local test pack",
        version: "0.1.0",
        manifest: {
          instructions: {
            codingStyle: ["Local rule one."],
          },
        },
      }),
      "utf8",
    );

    await writeManifest(tempDir, {
      packs: [{ source: "local", id: "my-local", path: "packs/my-local" }],
    });

    await runInstall(tempDir);

    const lockfile = await readLockfile(tempDir);
    expect(lockfile).toBeDefined();
    expect(lockfile!.packs).toHaveLength(1);
    expect(lockfile!.packs[0].id).toBe("my-local");
    expect(lockfile!.packs[0].source).toBe("local");
    expect(lockfile!.packs[0].resolvedPath).toBe("packs/my-local");
  });
});
