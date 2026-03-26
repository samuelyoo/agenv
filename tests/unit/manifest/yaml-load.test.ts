import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadManifest } from "../../../src/manifest/load.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { stringify } from "yaml";

async function makeTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "agenv-yaml-"));
}

describe("YAML manifest loading", () => {
  it("loads ai-workspace.yaml", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "yaml-test", framework: "react", projectType: "web-app" });
    await writeFile(join(cwd, "ai-workspace.yaml"), stringify(manifest), "utf-8");

    const result = await loadManifest(cwd);
    expect(result.manifest.project.name).toBe("yaml-test");
    expect(result.sharedPath).toContain("ai-workspace.yaml");
  });

  it("loads ai-workspace.yml", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "yml-test", framework: "react", projectType: "web-app" });
    await writeFile(join(cwd, "ai-workspace.yml"), stringify(manifest), "utf-8");

    const result = await loadManifest(cwd);
    expect(result.manifest.project.name).toBe("yml-test");
    expect(result.sharedPath).toContain("ai-workspace.yml");
  });

  it("prefers JSON over YAML when both exist", async () => {
    const cwd = await makeTempDir();
    const jsonManifest = buildRecommendedManifest({ name: "json-wins", framework: "react", projectType: "web-app" });
    const yamlManifest = buildRecommendedManifest({ name: "yaml-loses", framework: "react", projectType: "web-app" });
    await writeFile(join(cwd, "ai-workspace.json"), JSON.stringify(jsonManifest), "utf-8");
    await writeFile(join(cwd, "ai-workspace.yaml"), stringify(yamlManifest), "utf-8");

    const result = await loadManifest(cwd);
    expect(result.manifest.project.name).toBe("json-wins");
  });

  it("throws when no manifest file exists", async () => {
    const cwd = await makeTempDir();
    await expect(loadManifest(cwd)).rejects.toThrow();
  });
});
