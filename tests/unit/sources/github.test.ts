import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { GitHubResolver } from "../../../src/sources/github.js";
import type { ManifestPackRef } from "../../../src/packs/schema.js";
import { SourceResolutionError } from "../../../src/errors.js";

describe("GitHubResolver", () => {
  let tempDir: string;
  const resolver = new GitHubResolver();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "agenv-github-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  function makeRef(path: string): ManifestPackRef {
    return { source: "github", id: "test-org/test-pack", version: "1.0.0", path };
  }

  it("resolves valid pack definition from fixture directory", async () => {
    const packDir = join(tempDir, "my-pack");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "agenv-pack.json"),
      JSON.stringify({
        id: "test-org/test-pack",
        name: "Test Pack",
        description: "A remote test pack",
        version: "1.0.0",
        manifest: { instructions: { codingStyle: ["test"], reviewRules: ["test"] } },
      }),
    );

    const result = await resolver.resolve(makeRef(packDir));
    expect(result.definition.id).toBe("test-org/test-pack");
    expect(result.definition.name).toBe("Test Pack");
  });

  it("returns checksum and sourceUrl", async () => {
    const packDir = join(tempDir, "my-pack");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "agenv-pack.json"),
      JSON.stringify({
        id: "test-org/test-pack",
        name: "Test Pack",
        description: "A remote test pack",
        version: "1.0.0",
        manifest: { instructions: { codingStyle: ["test"], reviewRules: ["test"] } },
      }),
    );

    const result = await resolver.resolve(makeRef(packDir));
    expect(typeof result.checksum).toBe("string");
    expect(result.checksum.length).toBeGreaterThan(0);
    expect(typeof result.sourceUrl).toBe("string");
    expect(result.sourceUrl).toContain("test-org/test-pack");
  });

  it("throws SourceResolutionError for missing manifest", async () => {
    const packDir = join(tempDir, "empty-pack");
    await mkdir(packDir, { recursive: true });

    await expect(resolver.resolve(makeRef(packDir))).rejects.toThrow(SourceResolutionError);
  });

  it("throws SourceResolutionError for invalid manifest", async () => {
    const packDir = join(tempDir, "bad-pack");
    await mkdir(packDir, { recursive: true });
    await writeFile(join(packDir, "agenv-pack.json"), JSON.stringify({ invalid: true }));

    await expect(resolver.resolve(makeRef(packDir))).rejects.toThrow(SourceResolutionError);
  });

  it("validates resolved definition against packDefinitionSchema", async () => {
    const packDir = join(tempDir, "valid-pack");
    await mkdir(packDir, { recursive: true });
    await writeFile(
      join(packDir, "agenv-pack.json"),
      JSON.stringify({
        id: "test-org/valid-pack",
        name: "Valid Pack",
        description: "A valid remote pack",
        version: "2.0.0",
        manifest: {
          instructions: { codingStyle: ["rule1"], reviewRules: ["rule2"] },
          conventions: { folderStructure: "flat" },
        },
      }),
    );

    const result = await resolver.resolve(makeRef(packDir));
    expect(result.definition.version).toBe("2.0.0");
    expect(result.definition.manifest.conventions?.folderStructure).toBe("flat");
  });
});
