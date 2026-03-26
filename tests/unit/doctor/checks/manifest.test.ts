import { describe, expect, it } from "vitest";
import { runManifestChecks } from "../../../../src/doctor/checks/manifest.js";
import { buildRecommendedManifest } from "../../../../src/manifest/defaults.js";

describe("runManifestChecks", () => {
  it("returns error when manifest is undefined and loadError exists", () => {
    const findings = runManifestChecks(undefined, new Error("file not found"));
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.severity === "error")).toBe(true);
    expect(findings.some((f) => f.code === "manifest_load_failed")).toBe(true);
  });

  it("returns error when manifest is undefined with no loadError", () => {
    const findings = runManifestChecks(undefined, undefined);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.severity === "error")).toBe(true);
    expect(findings.some((f) => f.code === "manifest_missing")).toBe(true);
  });

  it("returns info when manifest loads successfully", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    const findings = runManifestChecks(manifest, undefined);
    const errors = findings.filter((f) => f.severity === "error");
    expect(errors).toHaveLength(0);
  });
});
