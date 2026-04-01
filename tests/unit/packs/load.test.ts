import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadPacks } from "../../../src/packs/load.js";
import type { ManifestPackRef } from "../../../src/packs/schema.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "agenv-load-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("loadPacks", () => {
  it("loads a builtin pack by ref", async () => {
    const refs: ManifestPackRef[] = [
      { source: "builtin", id: "secure-defaults" },
    ];
    const result = await loadPacks(tempDir, refs);
    expect(result.errors).toHaveLength(0);
    expect(result.loaded).toHaveLength(1);
    expect(result.loaded[0].definition.id).toBe("secure-defaults");
  });

  it("returns error for unknown builtin pack id", async () => {
    const refs: ManifestPackRef[] = [
      { source: "builtin", id: "nonexistent" },
    ];
    const result = await loadPacks(tempDir, refs);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.loaded).toHaveLength(0);
  });

  it("loads a local pack from temp directory with valid pack.json", async () => {
    const packDir = join(tempDir, "my-pack");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "pack.json"),
      JSON.stringify({
        id: "my-pack",
        name: "My Pack",
        description: "A test pack",
        version: "1.0.0",
        manifest: {
          instructions: {
            codingStyle: ["Use strict mode."],
          },
        },
      }),
      "utf8",
    );

    const refs: ManifestPackRef[] = [
      { source: "local", id: "my-pack", path: "my-pack" },
    ];
    const result = await loadPacks(tempDir, refs);
    expect(result.errors).toHaveLength(0);
    expect(result.loaded).toHaveLength(1);
    expect(result.loaded[0].definition.id).toBe("my-pack");
    expect(result.loaded[0].definition.source).toBe("local");
  });

  it("returns error for missing local pack.json", async () => {
    const refs: ManifestPackRef[] = [
      { source: "local", id: "missing", path: "missing-dir" },
    ];
    const result = await loadPacks(tempDir, refs);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.loaded).toHaveLength(0);
  });

  it("returns error for invalid local pack.json", async () => {
    const packDir = join(tempDir, "bad-pack");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "pack.json"),
      JSON.stringify({ name: "missing id" }),
      "utf8",
    );

    const refs: ManifestPackRef[] = [
      { source: "local", id: "bad-pack", path: "bad-pack" },
    ];
    const result = await loadPacks(tempDir, refs);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.loaded).toHaveLength(0);
  });
});
