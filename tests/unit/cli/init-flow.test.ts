import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
  input: vi.fn(),
  confirm: vi.fn(),
  checkbox: vi.fn(),
}));

import { select, checkbox } from "@inquirer/prompts";
import { runInitFlow } from "../../../src/cli/prompts/init-flow.js";

describe("runInitFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it("produces a valid manifest for recommended dashboard setup", async () => {
    (checkbox as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      "copilot",
      "claude",
    ]);
    (select as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("dashboard")
      .mockResolvedValueOnce("recommended");

    const result = await runInitFlow();
    expect(result.projectType).toBe("dashboard");
    expect(result.setupDepth).toBe("recommended");
    expect(result.targets.copilot).toBe(true);
    expect(result.targets.claude).toBe(true);
    expect(result.targets.codex).toBe(false);
    expect(result.authModel).toBe("rbac");
  });

  it("produces a valid manifest for recommended api-service setup", async () => {
    (checkbox as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      "codex",
    ]);
    (select as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("api-service")
      .mockResolvedValueOnce("recommended");

    const result = await runInitFlow();
    expect(result.projectType).toBe("api-service");
    expect(result.framework).toBe("express");
    expect(result.ui).toBeUndefined();
    expect(result.data).toBeUndefined();
    expect(result.targets.codex).toBe(true);
  });

  it("skips MCP presets when MCP target is off", async () => {
    (checkbox as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      "copilot",
    ]);
    (select as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("web-app")
      .mockResolvedValueOnce("recommended");

    const result = await runInitFlow();
    expect(result.targets.mcp).toBe(false);
    expect(result.mcpPresets).toEqual([]);
  });
});
