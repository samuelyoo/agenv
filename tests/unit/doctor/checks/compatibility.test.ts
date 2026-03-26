import { describe, expect, it } from "vitest";
import { runCompatibilityChecks } from "../../../../src/doctor/checks/compatibility.js";
import { buildRecommendedManifest } from "../../../../src/manifest/defaults.js";
import type { RepoInspection } from "../../../../src/detect/repo-inspector.js";

function makeInspection(overrides?: Partial<RepoInspection>): RepoInspection {
  return {
    projectName: "test",
    framework: undefined,
    packageManager: "npm",
    existingAiFiles: [],
    hints: { styling: undefined, dataFetching: undefined, tables: undefined, forms: undefined },
    ...overrides,
  };
}

describe("runCompatibilityChecks", () => {
  it("returns empty when manifest is undefined", () => {
    expect(runCompatibilityChecks(undefined, makeInspection())).toEqual([]);
  });

  it("warns on framework mismatch", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    const inspection = makeInspection({ framework: "nextjs" });
    const findings = runCompatibilityChecks(manifest, inspection);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.severity).toBe("warning");
    expect(findings[0]!.code).toBe("framework_mismatch");
  });

  it("returns no warnings when frameworks match", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    const inspection = makeInspection({ framework: "react" });
    const warnings = runCompatibilityChecks(manifest, inspection).filter((f) => f.severity === "warning");
    expect(warnings).toHaveLength(0);
  });

  it("returns no warnings when inspection has no framework", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    const inspection = makeInspection({ framework: undefined });
    const warnings = runCompatibilityChecks(manifest, inspection).filter((f) => f.severity === "warning");
    expect(warnings).toHaveLength(0);
  });
});
