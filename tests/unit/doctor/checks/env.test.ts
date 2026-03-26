import { describe, expect, it } from "vitest";
import { runEnvChecks } from "../../../../src/doctor/checks/env.js";
import { buildRecommendedManifest } from "../../../../src/manifest/defaults.js";

describe("runEnvChecks", () => {
  it("returns empty when manifest is undefined", () => {
    expect(runEnvChecks(undefined)).toEqual([]);
  });

  it("returns info when MCP presets are configured", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "dashboard" });
    manifest.generated.mcpPresets = ["fetch"];
    const findings = runEnvChecks(manifest);
    expect(findings.some((f) => f.code === "env_placeholders_expected")).toBe(true);
  });

  it("returns empty when no MCP presets", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.generated.mcpPresets = [];
    const findings = runEnvChecks(manifest);
    const envFindings = findings.filter((f) => f.code.includes("env"));
    expect(envFindings).toHaveLength(0);
  });
});
