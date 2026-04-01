import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runAudit } from "../../../src/audit/index.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { saveManifest } from "../../../src/manifest/save.js";
import { runGenerate } from "../../../src/cli/commands/generate.js";

const tempDirs: string[] = [];

async function makeTempRepo() {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-audit-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
});

describe("runAudit", () => {
  it("returns pass when no issues", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "dashboard" });
    manifest.targets.mcp = false;
    await saveManifest(cwd, manifest);
    await runGenerate({ cwd });

    const result = await runAudit(cwd);
    expect(result.status).toBe("pass");
  });

  it("returns fail when error-level findings exist", async () => {
    const cwd = await makeTempRepo();
    // No manifest → audit should fail or produce error-level findings
    const result = await runAudit(cwd);
    expect(result.status).toBe("fail");
  });

  it("includes ownership report", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "dashboard" });
    await saveManifest(cwd, manifest);
    await runGenerate({ cwd });

    const result = await runAudit(cwd);
    expect(result.ownership).toBeDefined();
    expect(result.ownership.entries.length).toBeGreaterThan(0);
  });

  it("handles missing manifest gracefully", async () => {
    const cwd = await makeTempRepo();
    const result = await runAudit(cwd);
    expect(result).toBeDefined();
    expect(result.findings.length).toBeGreaterThan(0);
  });
});
