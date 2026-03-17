import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runDiff } from "../../src/cli/commands/diff.js";
import { runGenerate } from "../../src/cli/commands/generate.js";
import { buildRecommendedManifest } from "../../src/manifest/defaults.js";
import { saveManifest } from "../../src/manifest/save.js";

const tempDirs: string[] = [];

async function makeTempRepo(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-diff-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((cwd) => rm(cwd, { recursive: true, force: true })));
});

describe("runDiff", () => {
  it("reports unchanged files after generation", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "vite-react",
    });

    await saveManifest(cwd, manifest);
    await runGenerate({ cwd });

    const diff = await runDiff({ cwd });

    expect(diff.summary.create).toEqual([]);
    expect(diff.summary.update).toEqual([]);
    expect(diff.summary.skip).toEqual([]);
    expect(diff.summary.unchanged).toEqual(
      expect.arrayContaining(["AGENTS.md", "docs/ai-architecture.md"]),
    );
  });

  it("skips overwriting manual markdown files without a generated header", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "nextjs",
    });

    await saveManifest(cwd, manifest);
    await writeFile(join(cwd, "AGENTS.md"), "# Manual file\n", "utf8");

    const diff = await runDiff({ cwd });

    expect(diff.summary.skip).toContain("AGENTS.md");
    expect(diff.summary.create).toContain("docs/ai-architecture.md");
  });
});
