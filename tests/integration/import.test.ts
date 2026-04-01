import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runImport } from "../../src/import/index.js";

let cwd: string;

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), "agenv-test-import-"));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

describe("runImport (integration)", () => {
  it("returns no findings for an empty directory", async () => {
    const result = await runImport(cwd);
    expect(result.report.findings).toHaveLength(0);
    expect(result.candidateTargets).toEqual({});
  });

  it("detects AGENTS.md + .claude/ + valid .mcp.json and merges targets", async () => {
    await writeFile(join(cwd, "AGENTS.md"), "# MyProject\nUse nextjs.\n");
    await mkdir(join(cwd, ".claude"));
    await writeFile(
      join(cwd, ".mcp.json"),
      JSON.stringify({ mcpServers: { "test-server": { command: "npx", args: [] } } }),
    );

    const result = await runImport(cwd);

    expect(result.candidateTargets.codex).toBe(true);
    expect(result.candidateTargets.claude).toBe(true);
    expect(result.candidateTargets.mcp).toBe(true);
    expect(result.report.findings.length).toBeGreaterThanOrEqual(3);
  });

  it("respects the from filter — only runs specified detectors", async () => {
    await writeFile(join(cwd, "AGENTS.md"), "# Test\nUse react.\n");
    await mkdir(join(cwd, ".claude"));

    const result = await runImport(cwd, { from: ["codex"] });

    expect(result.candidateTargets.codex).toBe(true);
    expect(result.candidateTargets.claude).toBeUndefined();
  });
});
