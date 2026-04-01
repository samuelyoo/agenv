import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectWindsurf } from "../../../../src/import/detectors/windsurf.js";

let cwd: string;

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), "agenv-test-windsurf-"));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

describe("detectWindsurf", () => {
  it("returns empty result when .windsurfrules is absent", async () => {
    const result = await detectWindsurf(cwd);
    expect(result.findings).toHaveLength(0);
  });

  it("returns targets.windsurf high confidence when .windsurfrules is present", async () => {
    await writeFile(join(cwd, ".windsurfrules"), "Use TypeScript.\n");
    const result = await detectWindsurf(cwd);
    const finding = result.findings.find((f) => f.field === "targets.windsurf");
    expect(finding).toBeDefined();
    expect(finding!.confidence).toBe("high");
    expect(finding!.value).toBe(true);
  });
});
