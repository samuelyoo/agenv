import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectMcp } from "../../../../src/import/detectors/mcp.js";

let cwd: string;

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), "agenv-test-mcp-"));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

describe("detectMcp", () => {
  it("returns empty result when .mcp.json is absent", async () => {
    const result = await detectMcp(cwd);
    expect(result.findings).toHaveLength(0);
    expect(result.unsupported).toHaveLength(0);
  });

  it("returns targets.mcp high confidence when .mcp.json has mcpServers entries", async () => {
    const content = JSON.stringify({
      mcpServers: { "my-server": { command: "npx", args: ["my-server"] } },
    });
    await writeFile(join(cwd, ".mcp.json"), content);
    const result = await detectMcp(cwd);
    const finding = result.findings.find((f) => f.field === "targets.mcp");
    expect(finding).toBeDefined();
    expect(finding!.confidence).toBe("high");
    expect(finding!.value).toBe(true);
  });

  it("returns no findings when .mcp.json has empty mcpServers", async () => {
    const content = JSON.stringify({ mcpServers: {} });
    await writeFile(join(cwd, ".mcp.json"), content);
    const result = await detectMcp(cwd);
    const finding = result.findings.find((f) => f.field === "targets.mcp");
    expect(finding).toBeUndefined();
  });

  it("records unsupported entry when .mcp.json is malformed JSON", async () => {
    await writeFile(join(cwd, ".mcp.json"), "{ not valid json }");
    const result = await detectMcp(cwd);
    expect(result.findings).toHaveLength(0);
    expect(result.unsupported).toHaveLength(1);
    expect(result.unsupported[0].reason).toContain("not valid JSON");
  });
});
