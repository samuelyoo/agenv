import { describe, expect, it } from "vitest";
import { manifestSchema } from "../../../src/manifest/schema.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";

describe("schema v2 validation", () => {
  it("validates manifest with language python", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "none", language: "python" });
    const result = manifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project.language).toBe("python");
    }
  });

  it("validates manifest with language other", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "none", language: "other" });
    const result = manifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("validates manifest with framework django", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "django", language: "python" });
    const result = manifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project.framework).toBe("django");
    }
  });

  it("validates manifest with framework none", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "none" });
    const result = manifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project.framework).toBe("none");
    }
  });

  it("rejects invalid language value", () => {
    const result = manifestSchema.safeParse({
      schemaVersion: "2",
      project: { name: "test", type: "web-app", framework: "react", language: "cobol" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid framework value", () => {
    const result = manifestSchema.safeParse({
      schemaVersion: "2",
      project: { name: "test", type: "web-app", framework: "angular", language: "ts" },
    });
    expect(result.success).toBe(false);
  });
});
