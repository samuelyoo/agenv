import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runPathChecks } from "../../../../src/doctor/checks/paths.js";
import { buildRecommendedManifest } from "../../../../src/manifest/defaults.js";

async function makeTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "agenv-path-check-"));
}

describe("runPathChecks", () => {
  it("returns empty when manifest is undefined", async () => {
    const cwd = await makeTempDir();
    expect(await runPathChecks(cwd, undefined)).toEqual([]);
  });

  it("returns empty when scope is shared", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.setup.scope = "shared";
    expect(await runPathChecks(cwd, manifest)).toEqual([]);
  });

  it("warns when scope is local but ai-workspace.local.json is missing", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.setup.scope = "local";
    const findings = await runPathChecks(cwd, manifest);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.code).toBe("local_override_missing");
  });

  it("returns empty when scope is local and ai-workspace.local.json exists", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.setup.scope = "local";
    await writeFile(join(cwd, "ai-workspace.local.json"), "{}", "utf-8");
    const findings = await runPathChecks(cwd, manifest);
    const warnings = findings.filter((f) => f.severity === "warning");
    expect(warnings).toHaveLength(0);
  });
});
