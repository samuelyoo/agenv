import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { checkMcpEnvVars, checkMcpConfigFormat } from "../../../../src/doctor/checks/mcp.js";
import { buildRecommendedManifest } from "../../../../src/manifest/defaults.js";

async function makeTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "agenv-mcp-check-"));
}

describe("checkMcpEnvVars", () => {
  it("returns empty when manifest is undefined", () => {
    expect(checkMcpEnvVars(undefined)).toEqual([]);
  });

  it("returns empty when no MCP presets", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.generated.mcpPresets = [];
    expect(checkMcpEnvVars(manifest)).toEqual([]);
  });
});

describe("checkMcpConfigFormat", () => {
  it("returns empty when manifest is undefined", async () => {
    const cwd = await makeTempDir();
    expect(await checkMcpConfigFormat(cwd, undefined)).toEqual([]);
  });

  it("warns when .mcp.json is missing", async () => {
    const cwd = await makeTempDir();
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "dashboard" });
    manifest.targets.mcp = true;
    const findings = await checkMcpConfigFormat(cwd, manifest);
    expect(findings.some((f) => f.code === "mcp_config_missing")).toBe(true);
  });

  it("reports error for invalid JSON in .mcp.json", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, ".mcp.json"), "{ not valid json", "utf-8");
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "dashboard" });
    manifest.targets.mcp = true;
    const findings = await checkMcpConfigFormat(cwd, manifest);
    const errors = findings.filter((f) => f.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((f) => f.code === "mcp_config_invalid_json")).toBe(true);
  });

  it("reports error when mcpServers key is missing", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, ".mcp.json"), JSON.stringify({ servers: {} }), "utf-8");
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "dashboard" });
    manifest.targets.mcp = true;
    const findings = await checkMcpConfigFormat(cwd, manifest);
    expect(findings.some((f) => f.code === "mcp_config_missing_servers")).toBe(true);
  });

  it("accepts valid .mcp.json with mcpServers", async () => {
    const cwd = await makeTempDir();
    await writeFile(
      join(cwd, ".mcp.json"),
      JSON.stringify({ mcpServers: { test: { command: "npx", args: ["test"] } } }),
      "utf-8",
    );
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "dashboard" });
    manifest.targets.mcp = true;
    const findings = await checkMcpConfigFormat(cwd, manifest);
    const errors = findings.filter((f) => f.severity === "error");
    expect(errors).toHaveLength(0);
  });
});
