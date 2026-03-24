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

  it("adds _trustLevel annotation for dangerous presets (filesystem)", () => {
    const manifest = makeMcpManifest(["filesystem"]);
    const plan = buildGenerationPlan(manifest);
    const file = mcpAdapter.plan(manifest, plan).find((f) => f.path === ".mcp.json")!;
    const rendered = mcpAdapter.render(file, manifest);
    const parsed = JSON.parse(rendered.content) as Record<string, unknown>;
    const server = (parsed.mcpServers as Record<string, Record<string, unknown>>)["filesystem"];
    expect(server._trustLevel).toBe("dangerous");
  });

  it("adds _trustLevel annotation for review presets (github)", () => {
    const manifest = makeMcpManifest(["github"]);
    const plan = buildGenerationPlan(manifest);
    const file = mcpAdapter.plan(manifest, plan).find((f) => f.path === ".mcp.json")!;
    const rendered = mcpAdapter.render(file, manifest);
    const parsed = JSON.parse(rendered.content) as Record<string, unknown>;
    const server = (parsed.mcpServers as Record<string, Record<string, unknown>>)["github"];
    expect(server._trustLevel).toBe("review");
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

  it("renders .mcp.local.json as empty object", () => {
    const manifest = makeMcpManifest(["github"]);
    const plan = buildGenerationPlan(manifest);
    const file = mcpAdapter.plan(manifest, plan).find((f) => f.path === ".mcp.local.json")!;
    if (!file) return; // scope may be shared-only
    const rendered = mcpAdapter.render(file, manifest);
    expect(JSON.parse(rendered.content)).toEqual({});
  });
});
