import { describe, expect, it } from "vitest";
import { runRepoMatchChecks } from "../../../../src/doctor/checks/repo-match.js";
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

describe("runRepoMatchChecks", () => {
  it("returns empty when manifest is undefined", () => {
    expect(runRepoMatchChecks(undefined, makeInspection())).toEqual([]);
  });

  it("returns empty when names match", () => {
    const manifest = buildRecommendedManifest({ name: "my-app", framework: "react", projectType: "web-app" });
    const inspection = makeInspection({ projectName: "my-app" });
    expect(runRepoMatchChecks(manifest, inspection)).toEqual([]);
  });

  it("warns when names mismatch", () => {
    const manifest = buildRecommendedManifest({ name: "manifest-name", framework: "react", projectType: "web-app" });
    const inspection = makeInspection({ projectName: "folder-name" });
    const findings = runRepoMatchChecks(manifest, inspection);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.severity).toBe("warning");
    expect(findings[0]!.code).toBe("project_name_mismatch");
  });
});
