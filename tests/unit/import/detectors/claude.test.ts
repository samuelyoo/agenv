import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectClaude } from "../../../../src/import/detectors/claude.js";

let cwd: string;

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), "agenv-test-claude-"));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

describe("detectClaude", () => {
  it("returns empty result when .claude dir is absent", async () => {
    const result = await detectClaude(cwd);
    expect(result.findings).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.unsupported).toHaveLength(0);
  });

  it("returns targets.claude high confidence when .claude/ dir exists", async () => {
    await mkdir(join(cwd, ".claude"));
    const result = await detectClaude(cwd);
    const finding = result.findings.find((f) => f.field === "targets.claude");
    expect(finding).toBeDefined();
    expect(finding!.confidence).toBe("high");
    expect(finding!.value).toBe(true);
  });

  it("extracts project.name from CLAUDE.md heading when present (low confidence)", async () => {
    await mkdir(join(cwd, ".claude"));
    await writeFile(join(cwd, ".claude", "CLAUDE.md"), "# ProjectAlpha\n\nSome context.\n");
    const result = await detectClaude(cwd);
    const nameFinding = result.findings.find((f) => f.field === "project.name");
    expect(nameFinding).toBeDefined();
    expect(nameFinding!.confidence).toBe("low");
    expect(nameFinding!.value).toBe("ProjectAlpha");
  });
});
