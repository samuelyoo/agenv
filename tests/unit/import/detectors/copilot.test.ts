import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectCopilot } from "../../../../src/import/detectors/copilot.js";

let cwd: string;

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), "agenv-test-copilot-"));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

describe("detectCopilot", () => {
  it("returns empty result when .github/copilot-instructions.md is absent", async () => {
    const result = await detectCopilot(cwd);
    expect(result.findings).toHaveLength(0);
  });

  it("returns targets.copilot high confidence when file is present", async () => {
    await mkdir(join(cwd, ".github"), { recursive: true });
    await writeFile(
      join(cwd, ".github", "copilot-instructions.md"),
      "Use TypeScript.\n",
    );
    const result = await detectCopilot(cwd);
    const finding = result.findings.find((f) => f.field === "targets.copilot");
    expect(finding).toBeDefined();
    expect(finding!.confidence).toBe("high");
    expect(finding!.value).toBe(true);
  });
});
