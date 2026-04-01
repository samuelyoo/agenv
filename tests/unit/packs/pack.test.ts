import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateLocalPack } from "../../../src/packs/pack.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "agenv-pack-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("validateLocalPack", () => {
  it("validates a correct local pack directory", async () => {
    const packDir = join(tempDir, "my-pack");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "pack.json"),
      JSON.stringify({
        id: "my-pack",
        name: "My Pack",
        description: "A valid test pack",
        version: "1.0.0",
        manifest: {
          instructions: {
            codingStyle: ["Use strict mode."],
          },
        },
      }),
      "utf8",
    );

    const result = await validateLocalPack(packDir);
    expect(result.valid).toBe(true);
    expect(result.id).toBe("my-pack");
    expect(result.name).toBe("My Pack");
    expect(result.errors).toHaveLength(0);
  });

  it("returns invalid when pack.json is missing", async () => {
    const packDir = join(tempDir, "empty-dir");
    await mkdir(packDir, { recursive: true });

    const result = await validateLocalPack(packDir);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns errors when pack.json is missing required id", async () => {
    const packDir = join(tempDir, "no-id");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "pack.json"),
      JSON.stringify({
        name: "No Id Pack",
        description: "Missing id",
        version: "1.0.0",
        manifest: {},
      }),
      "utf8",
    );

    const result = await validateLocalPack(packDir);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns errors when manifest fragment is invalid", async () => {
    const packDir = join(tempDir, "bad-manifest");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "pack.json"),
      JSON.stringify({
        id: "bad-manifest",
        name: "Bad Manifest",
        description: "Invalid manifest",
        version: "1.0.0",
        manifest: {
          instructions: {
            codingStyle: "not-an-array",
          },
        },
      }),
      "utf8",
    );

    const result = await validateLocalPack(packDir);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
