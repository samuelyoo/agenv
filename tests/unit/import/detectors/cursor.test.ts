import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectCursor } from "../../../../src/import/detectors/cursor.js";

let cwd: string;

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), "agenv-test-cursor-"));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

describe("detectCursor", () => {
  it("returns empty result when neither .cursorrules nor .cursor/ exist", async () => {
    const result = await detectCursor(cwd);
    expect(result.findings).toHaveLength(0);
  });

  it("returns targets.cursor high confidence when .cursorrules is present", async () => {
    await writeFile(join(cwd, ".cursorrules"), "Use TypeScript strict mode.\n");
    const result = await detectCursor(cwd);
    const finding = result.findings.find((f) => f.field === "targets.cursor");
    expect(finding).toBeDefined();
    expect(finding!.confidence).toBe("high");
    expect(finding!.value).toBe(true);
  });

  it("returns targets.cursor high confidence when .cursor/rules/ dir exists", async () => {
    await mkdir(join(cwd, ".cursor", "rules"), { recursive: true });
    const result = await detectCursor(cwd);
    const finding = result.findings.find((f) => f.field === "targets.cursor");
    expect(finding).toBeDefined();
    expect(finding!.confidence).toBe("high");
  });
});
