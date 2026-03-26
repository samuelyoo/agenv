import { describe, expect, it } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runDoctor } from "../../../src/doctor/run.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { saveManifest } from "../../../src/manifest/save.js";

async function makeTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "agenv-doctor-gate-"));
}

describe("doctor supports() gate", () => {
  it("skips MCP checks when MCP target is disabled", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({
      name: "test-no-mcp",
      framework: "react",
      projectType: "web-app",
    });
    manifest.targets.mcp = false;
    manifest.generated.mcpPresets = [];
    await saveManifest(cwd, manifest);

    const result = await runDoctor(cwd, { strict: false, targets: [] });

    const mcpFindings = [...result.errors, ...result.warnings, ...result.info].filter((f) =>
      f.code.startsWith("mcp"),
    );
    expect(mcpFindings).toHaveLength(0);
  });

  it("runs MCP checks when MCP target is enabled", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({
      name: "test-with-mcp",
      framework: "react",
      projectType: "dashboard",
    });
    manifest.targets.mcp = true;
    manifest.generated.mcpPresets = ["fetch"];
    await saveManifest(cwd, manifest);

    const result = await runDoctor(cwd, { strict: false, targets: [] });

    const mcpFindings = [...result.errors, ...result.warnings, ...result.info].filter((f) =>
      f.code.startsWith("mcp"),
    );
    expect(mcpFindings.length).toBeGreaterThan(0);
  });
});
