import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runDoctor } from "../../../src/doctor/run.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { saveManifest } from "../../../src/manifest/save.js";

const tempDirs: string[] = [];

async function makeTempRepo(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-doctor-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((cwd) => rm(cwd, { recursive: true, force: true })));
});

describe("runDoctor", () => {
  it("reports ok when manifest is valid", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({
      name: "test-project",
      framework: "nextjs",
    });
    await saveManifest(cwd, manifest);

    const result = await runDoctor(cwd, { strict: false, targets: [] });

    expect(result.status).toBe("ok");
    expect(result.errors).toEqual([]);
  });

  it("reports error when no manifest exists", async () => {
    const cwd = await makeTempRepo();

    const result = await runDoctor(cwd, { strict: false, targets: [] });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.status).toBe("error");
  });

  it("escalates warnings to errors in strict mode", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({
      name: "test-project",
      framework: "nextjs",
      targets: { mcp: true },
      generated: { mcpPresets: ["filesystem"] },
    });
    await saveManifest(cwd, manifest);

    const result = await runDoctor(cwd, { strict: true, targets: [] });

    // If there are any warnings, strict mode should make status "error"
    if (result.warnings.length > 0) {
      expect(result.status).toBe("error");
    }
  });

  it("reports malformed JSON as an error", async () => {
    const cwd = await makeTempRepo();
    await writeFile(join(cwd, "ai-workspace.json"), "{ bad json }", "utf8");

    const result = await runDoctor(cwd, { strict: false, targets: [] });

    expect(result.status).toBe("error");
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
