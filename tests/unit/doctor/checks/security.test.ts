import { describe, expect, it } from "vitest";
import { runSecurityChecks } from "../../../../src/doctor/checks/security.js";
import { buildRecommendedManifest } from "../../../../src/manifest/defaults.js";

describe("runSecurityChecks", () => {
  it("returns empty when manifest is undefined", () => {
    expect(runSecurityChecks(undefined)).toEqual([]);
  });

  it("warns when MCP is enabled", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "dashboard" });
    manifest.targets.mcp = true;
    const findings = runSecurityChecks(manifest);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.code === "mcp_review_required")).toBe(true);
  });

  it("returns empty when MCP is disabled", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.targets.mcp = false;
    const warnings = runSecurityChecks(manifest).filter((f) => f.severity === "warning");
    expect(warnings).toHaveLength(0);
  });
});
