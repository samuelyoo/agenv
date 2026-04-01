import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runInstall } from "../../../src/install/apply.js";
import { readLockfile } from "../../../src/install/lockfile.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { formatJson } from "../../../src/utils/json.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "agenv-apply-test-"));
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

describe("runInstall", () => {
  it("writes lockfile with builtin packs", async () => {
    await writeManifest(tempDir, {
      packs: [{ source: "builtin", id: "secure-defaults" }],
    });

    const result = await runInstall(tempDir);
    expect(result.lockfilePath).toContain("ai-workspace.lock");

    const lockfile = await readLockfile(tempDir);
    expect(lockfile).toBeDefined();
    expect(lockfile!.packs).toHaveLength(1);
    expect(lockfile!.packs[0].id).toBe("secure-defaults");
  });

  it("does not write lockfile in dry-run mode", async () => {
    await writeManifest(tempDir, {
      packs: [{ source: "builtin", id: "secure-defaults" }],
    });

    const result = await runInstall(tempDir, { dryRun: true });
    expect(result.lockfilePath).toContain("ai-workspace.lock");

    const lockfile = await readLockfile(tempDir);
    expect(lockfile).toBeUndefined();
  });

  it("produces lockfile with empty packs array when no packs", async () => {
    await writeManifest(tempDir);

    const result = await runInstall(tempDir);
    const lockfile = await readLockfile(tempDir);
    expect(lockfile).toBeDefined();
    expect(lockfile!.packs).toHaveLength(0);
    expect(result.plan.items).toHaveLength(0);
  });
});
