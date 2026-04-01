import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectCodex } from "../../../../src/import/detectors/codex.js";

let cwd: string;

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), "agenv-test-codex-"));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

describe("detectCodex", () => {
  it("returns empty result when AGENTS.md is absent", async () => {
    const result = await detectCodex(cwd);
    expect(result.findings).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.unsupported).toHaveLength(0);
  });

  it("returns targets.codex high confidence when AGENTS.md is present", async () => {
    await writeFile(join(cwd, "AGENTS.md"), "## Guidelines\nUse TypeScript.\n");
    const result = await detectCodex(cwd);
    const finding = result.findings.find((f) => f.field === "targets.codex");
    expect(finding).toBeDefined();
    expect(finding!.confidence).toBe("high");
    expect(finding!.value).toBe(true);
  });

  it("extracts project.name from first # heading (medium confidence)", async () => {
    await writeFile(join(cwd, "AGENTS.md"), "# MyApp\n\nSome content.\n");
    const result = await detectCodex(cwd);
    const nameFinding = result.findings.find((f) => f.field === "project.name");
    expect(nameFinding).toBeDefined();
    expect(nameFinding!.confidence).toBe("medium");
    expect(nameFinding!.value).toBe("MyApp");
  });

  it("does not extract project.name when heading is literally 'AGENTS'", async () => {
    await writeFile(join(cwd, "AGENTS.md"), "# AGENTS\n\nSome content.\n");
    const result = await detectCodex(cwd);
    const nameFinding = result.findings.find((f) => f.field === "project.name");
    expect(nameFinding).toBeUndefined();
  });

  it("detects nextjs framework from content (medium confidence)", async () => {
    await writeFile(join(cwd, "AGENTS.md"), "# AGENTS\n\nUse nextjs App Router.\n");
    const result = await detectCodex(cwd);
    const fwFinding = result.findings.find((f) => f.field === "project.framework");
    expect(fwFinding).toBeDefined();
    expect(fwFinding!.confidence).toBe("medium");
    expect(fwFinding!.value).toBe("nextjs");
  });

  it("detects react framework when no other framework matches", async () => {
    await writeFile(join(cwd, "AGENTS.md"), "# AGENTS\n\nUse React hooks.\n");
    const result = await detectCodex(cwd);
    const fwFinding = result.findings.find((f) => f.field === "project.framework");
    expect(fwFinding).toBeDefined();
    expect(fwFinding!.value).toBe("react");
  });

  it("does not emit framework finding when no keyword matches", async () => {
    await writeFile(join(cwd, "AGENTS.md"), "# AGENTS\n\nGeneric rules only.\n");
    const result = await detectCodex(cwd);
    const fwFinding = result.findings.find((f) => f.field === "project.framework");
    expect(fwFinding).toBeUndefined();
  });
});
