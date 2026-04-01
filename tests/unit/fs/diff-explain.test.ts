import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { summarizeRenderedDiff } from "../../../src/fs/diff.js";
import type { RenderedFile } from "../../../src/adapters/types.js";
import { buildGenerationPlan, type PlannedFile } from "../../../src/planner/build-plan.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { renderPlanFiles } from "../../../src/render/render-plan.js";

const tempDirs: string[] = [];

async function makeTempDir() {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-diff-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
});

describe("diff explanation entries", () => {
  it("includes entries array in DiffSummary", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react" });
    const plan = buildGenerationPlan(manifest);
    const rendered = renderPlanFiles(manifest, plan);
    const summary = await summarizeRenderedDiff(cwd, rendered, plan.files);
    expect(Array.isArray(summary.entries)).toBe(true);
  });

  it("entries contain target, layer, purpose", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react" });
    const plan = buildGenerationPlan(manifest);
    const rendered = renderPlanFiles(manifest, plan);
    const summary = await summarizeRenderedDiff(cwd, rendered, plan.files);

    for (const entry of summary.entries) {
      expect(entry.target).toBeTruthy();
      expect(entry.layer).toBeTruthy();
      expect(entry.purpose).toBeTruthy();
      expect(entry.action).toBeTruthy();
    }
  });

  it("entries reflect correct action for new files", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react" });
    const plan = buildGenerationPlan(manifest);
    const rendered = renderPlanFiles(manifest, plan);
    const summary = await summarizeRenderedDiff(cwd, rendered, plan.files);

    // All files should be "create" since nothing exists on disk
    expect(summary.entries.every((e) => e.action === "create")).toBe(true);
    expect(summary.entries.length).toBe(rendered.length);
  });

  it("entries match planned files count", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react" });
    const plan = buildGenerationPlan(manifest);
    const rendered = renderPlanFiles(manifest, plan);
    const summary = await summarizeRenderedDiff(cwd, rendered, plan.files);

    expect(summary.entries.length).toBe(plan.files.length);
  });
});
