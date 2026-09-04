import { describe, expect, it } from "vitest";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";
import { mcpAdapter } from "../../../src/adapters/mcp/index.js";
import { dashboardManifest } from "../../fixtures/manifests.js";

function makeMcpManifest(presets: string[] = ["github"]) {
  const base = dashboardManifest({ targets: { mcp: true }, generated: { mcpPresets: presets } });
  return base;
}

describe("mcpAdapter", () => {
  it("supports() returns true when mcp target is enabled", () => {
    const manifest = makeMcpManifest();
    expect(mcpAdapter.supports(manifest).supported).toBe(true);
  });

  it("supports() returns false when mcp target is disabled", () => {
    const manifest = dashboardManifest();
    expect(mcpAdapter.supports(manifest).supported).toBe(false);
  });

  it("plan() returns .mcp.json file", () => {
    const manifest = makeMcpManifest();
    const plan = buildGenerationPlan(manifest);
    const files = mcpAdapter.plan(manifest, plan);
    expect(files.some((f) => f.path === ".mcp.json")).toBe(true);
  });

  it("renders .mcp.json with mcpServers structure", () => {
    const manifest = makeMcpManifest(["github"]);
    const plan = buildGenerationPlan(manifest);
    const file = mcpAdapter.plan(manifest, plan).find((f) => f.path === ".mcp.json")!;
    const rendered = mcpAdapter.render(file, manifest);
    const parsed = JSON.parse(rendered.content) as Record<string, unknown>;
    expect(parsed).toHaveProperty("mcpServers");
    expect((parsed.mcpServers as Record<string, unknown>)["github"]).toBeDefined();
  });

  it("does not inject agenv-only trust keys into host configuration", () => {
    const manifest = makeMcpManifest(["filesystem"]);
    const plan = buildGenerationPlan(manifest);
    const file = mcpAdapter.plan(manifest, plan).find((f) => f.path === ".mcp.json")!;
    const rendered = mcpAdapter.render(file, manifest);
    const parsed = JSON.parse(rendered.content) as Record<string, unknown>;
    const server = (parsed.mcpServers as Record<string, Record<string, unknown>>)["filesystem"];
    expect(server._trustLevel).toBeUndefined();
    expect(server._trustNote).toBeUndefined();
  });

  it("renders hosted presets as HTTP servers", () => {
    const manifest = makeMcpManifest(["github"]);
    const plan = buildGenerationPlan(manifest);
    const file = mcpAdapter.plan(manifest, plan).find((f) => f.path === ".mcp.json")!;
    const rendered = mcpAdapter.render(file, manifest);
    const parsed = JSON.parse(rendered.content) as Record<string, unknown>;
    const server = (parsed.mcpServers as Record<string, Record<string, unknown>>)["github"];
    expect(server.type).toBe("http");
    expect(server.url).toBe("https://api.githubcopilot.com/mcp/");
  });

  it("does not add _trustLevel for safe presets (memory)", () => {
    const manifest = makeMcpManifest(["memory"]);
    const plan = buildGenerationPlan(manifest);
    const file = mcpAdapter.plan(manifest, plan).find((f) => f.path === ".mcp.json")!;
    const rendered = mcpAdapter.render(file, manifest);
    const parsed = JSON.parse(rendered.content) as Record<string, unknown>;
    const server = (parsed.mcpServers as Record<string, Record<string, unknown>>)["memory"];
    expect(server._trustLevel).toBeUndefined();
  });

  it("renders host-specific Codex, Cursor, and VS Code files", () => {
    const manifest = dashboardManifest({
      targets: { mcp: true, cursor: true },
      generated: { mcpPresets: ["filesystem"] },
    });
    const plan = buildGenerationPlan(manifest);
    const files = mcpAdapter.plan(manifest, plan);
    expect(files.map((file) => file.path)).toEqual(
      expect.arrayContaining([".codex/config.toml", ".cursor/mcp.json", ".vscode/mcp.json"]),
    );

    const codexFile = files.find((file) => file.path === ".codex/config.toml")!;
    expect(mcpAdapter.render(codexFile, manifest).content).toContain(
      '[mcp_servers."filesystem"]',
    );

    const vscodeFile = files.find((file) => file.path === ".vscode/mcp.json")!;
    expect(JSON.parse(mcpAdapter.render(vscodeFile, manifest).content)).toHaveProperty(
      "servers.filesystem",
    );
  });

  it("renders a valid empty Codex table when no presets are selected", () => {
    const manifest = makeMcpManifest([]);
    const plan = buildGenerationPlan(manifest);
    const file = mcpAdapter
      .plan(manifest, plan)
      .find((entry) => entry.path === ".codex/config.toml")!;

    expect(mcpAdapter.render(file, manifest).content).toContain("[mcp_servers]");
  });
});
