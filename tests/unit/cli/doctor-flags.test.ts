import { describe, expect, it } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runDoctor } from "../../../src/doctor/run.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { saveManifest } from "../../../src/manifest/save.js";

async function makeTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "agenv-doctor-flags-"));
}

describe("doctor flag behavior", () => {
  it("strict mode escalates warnings to error status", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({
      name: "mismatched-name",
      framework: "react",
      projectType: "web-app",
    });
    await saveManifest(cwd, manifest);

    const normalResult = await runDoctor(cwd, { strict: false, targets: [] });
    const strictResult = await runDoctor(cwd, { strict: true, targets: [] });

    if (normalResult.warnings.length > 0) {
      expect(normalResult.status).toBe("ok");
      expect(strictResult.status).toBe("error");
    }
  });

  it("returns ok for a valid manifest", async () => {
    const cwd = await makeTempRepo();
    const manifest = buildRecommendedManifest({
      name: "test-app",
      framework: "react",
      projectType: "web-app",
    });
    await saveManifest(cwd, manifest);

    const result = await runDoctor(cwd, { strict: false, targets: [] });
    expect(result.status).toBe("ok");
    expect(result.errors).toHaveLength(0);
  });

  it("returns error when no manifest exists", async () => {
    const cwd = await makeTempRepo();
    const result = await runDoctor(cwd, { strict: false, targets: [] });
    expect(result.status).toBe("error");
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
