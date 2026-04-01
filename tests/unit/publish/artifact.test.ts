import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildArtifact, writeArtifact, type PackArtifact } from "../../../src/publish/artifact.js";
import { publishPack } from "../../../src/publish/index.js";
import { PublishError } from "../../../src/errors.js";
import type { PackDefinition } from "../../../src/packs/schema.js";

const validDefinition: PackDefinition = {
  id: "my-pack",
  name: "My Pack",
  description: "A publishable pack",
  version: "1.0.0",
  source: "local",
  manifest: {
    instructions: {
      codingStyle: ["Use functional patterns."],
      reviewRules: ["Check for side effects."],
    },
  },
};

describe("buildArtifact", () => {
  it("returns valid PackArtifact", () => {
    const artifact = buildArtifact(validDefinition, "test-publisher");
    expect(artifact.id).toBe("my-pack");
    expect(artifact.version).toBe("1.0.0");
    expect(artifact.publisher).toBe("test-publisher");
    expect(artifact.definition).toEqual(validDefinition);
  });

  it("includes correct checksum", () => {
    const artifact = buildArtifact(validDefinition, "test-publisher");
    expect(typeof artifact.checksum).toBe("string");
    expect(artifact.checksum.length).toBe(64); // SHA-256 hex length
  });
});

describe("writeArtifact", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "agenv-publish-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("creates file on disk", async () => {
    const artifact = buildArtifact(validDefinition, "test-publisher");
    const outputPath = await writeArtifact(tempDir, artifact);
    const content = await readFile(outputPath, "utf8");
    const parsed = JSON.parse(content) as PackArtifact;
    expect(parsed.id).toBe("my-pack");
    expect(parsed.checksum).toBe(artifact.checksum);
  });
});

describe("publishPack", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "agenv-publish-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("validates before building", async () => {
    // Create a valid pack dir
    const { writeFile: wf, mkdir } = await import("node:fs/promises");
    const packDir = join(tempDir, "valid-pack");
    await mkdir(packDir, { recursive: true });
    await wf(
      join(packDir, "pack.json"),
      JSON.stringify({
        id: "valid-pack",
        name: "Valid Pack",
        description: "A valid pack",
        version: "1.0.0",
        manifest: { instructions: { codingStyle: ["code"], reviewRules: ["rule"] } },
      }),
    );

    const result = await publishPack(packDir, "publisher");
    expect(result.artifact.id).toBe("valid-pack");
    expect(typeof result.outputPath).toBe("string");
  });

  it("throws PublishError for invalid pack", async () => {
    const { writeFile: wf, mkdir } = await import("node:fs/promises");
    const packDir = join(tempDir, "invalid-pack");
    await mkdir(packDir, { recursive: true });
    await wf(join(packDir, "pack.json"), JSON.stringify({ broken: true }));

    await expect(publishPack(packDir, "publisher")).rejects.toThrow(PublishError);
  });
});
