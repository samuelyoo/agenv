import { describe, expect, it } from "vitest";
import { cursorAdapter } from "../../../src/adapters/cursor/index.js";
import {
  buildFrameworkGuidance,
  describeLanguage,
  sourceGlob,
} from "../../../src/adapters/project-context.js";
import { windsurfAdapter } from "../../../src/adapters/windsurf/index.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { frameworkSchema, languageSchema } from "../../../src/manifest/schema.js";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";

describe("adapter project context", () => {
  it.each(languageSchema.options)("maps %s to language-aware labels and globs", (language) => {
    const manifest = buildRecommendedManifest({
      name: "language-fixture",
      framework: language === "python" ? "fastapi" : "none",
      projectType: "api-service",
      language,
    });
    expect(describeLanguage(manifest)).not.toHaveLength(0);
    expect(sourceGlob(manifest)).not.toHaveLength(0);
    if (language !== "ts") {
      expect(sourceGlob(manifest)).not.toContain(".ts");
      expect(describeLanguage(manifest)).not.toContain("TypeScript");
    }
  });

  it.each(frameworkSchema.options)("has guidance for the %s framework", (framework) => {
    const manifest = buildRecommendedManifest({
      name: "framework-fixture",
      framework,
      projectType: "api-service",
    });
    expect(buildFrameworkGuidance(manifest).length).toBeGreaterThan(0);
  });

  it("renders Python-specific Cursor and Windsurf rules without TypeScript leakage", () => {
    const manifest = buildRecommendedManifest({
      name: "python-api",
      framework: "fastapi",
      projectType: "api-service",
      language: "python",
      targets: { cursor: true, windsurf: true },
    });
    const plan = buildGenerationPlan(manifest);
    const cursorContext = cursorAdapter.plan(manifest, plan).find((file) => file.path.endsWith("context.mdc"))!;
    const windsurfStyle = windsurfAdapter.plan(manifest, plan).find((file) => file.path.endsWith("coding-style.md"))!;
    const content = [
      cursorAdapter.render(cursorContext, manifest).content,
      windsurfAdapter.render(windsurfStyle, manifest).content,
    ].join("\n");
    expect(content).toContain("Python");
    expect(content).toContain("**/*.py");
    expect(content).not.toContain("TypeScript");
    expect(content).not.toContain("ts,tsx");
  });
});
