import { describe, expect, it } from "vitest";
import { checkCompatibility, type CompatibilityResult } from "../../../src/catalog/compatibility.js";
import type { CatalogEntry } from "../../../src/catalog/index.js";
import { dashboardManifest } from "../../fixtures/manifests.js";

function makeEntry(overrides?: Partial<CatalogEntry["compatibility"]>): CatalogEntry {
  return {
    id: "test-pack",
    version: "1.0.0",
    description: "A test pack",
    compatibility: {
      targets: overrides?.targets,
      projectTypes: overrides?.projectTypes,
      languages: overrides?.languages,
    },
    provenance: { source: "builtin", publisher: "agenv" },
    definition: {
      id: "test-pack",
      name: "Test Pack",
      description: "A test pack",
      version: "1.0.0",
      source: "builtin",
      manifest: { instructions: { codingStyle: ["test"], reviewRules: ["test"] } },
    },
  };
}

describe("checkCompatibility", () => {
  it("returns compatible when entry has no restrictions", () => {
    const entry = makeEntry({});
    const manifest = dashboardManifest();
    const result = checkCompatibility(entry, manifest);
    expect(result.compatible).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("returns compatible when targets match enabled targets", () => {
    const entry = makeEntry({ targets: ["copilot", "claude"] });
    const manifest = dashboardManifest({ targets: { copilot: true, claude: true, codex: false, mcp: false } });
    const result = checkCompatibility(entry, manifest);
    expect(result.compatible).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("warns when target not enabled", () => {
    const entry = makeEntry({ targets: ["cursor"] });
    const manifest = dashboardManifest({ targets: { copilot: true, claude: true, codex: false, mcp: false } });
    const result = checkCompatibility(entry, manifest);
    expect(result.compatible).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("cursor"))).toBe(true);
  });

  it("warns when projectType mismatches", () => {
    const entry = makeEntry({ projectTypes: ["api-service"] });
    const manifest = dashboardManifest();
    const result = checkCompatibility(entry, manifest);
    expect(result.compatible).toBe(false);
    expect(result.warnings.some((w) => w.includes("dashboard"))).toBe(true);
  });

  it("warns when language mismatches", () => {
    const entry = makeEntry({ languages: ["python"] });
    const manifest = dashboardManifest();
    const result = checkCompatibility(entry, manifest);
    expect(result.compatible).toBe(false);
    expect(result.warnings.some((w) => w.includes("ts") || w.includes("language"))).toBe(true);
  });

  it("returns compatible when all constraints match", () => {
    const entry = makeEntry({
      targets: ["copilot"],
      projectTypes: ["dashboard"],
      languages: ["ts"],
    });
    const manifest = dashboardManifest();
    const result = checkCompatibility(entry, manifest);
    expect(result.compatible).toBe(true);
    expect(result.warnings).toEqual([]);
  });
});
