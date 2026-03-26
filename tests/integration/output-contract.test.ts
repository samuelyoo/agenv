import { describe, it, expect } from "vitest";
import { OUTPUT_MAP } from "../../src/planner/output-map.js";
import { buildGenerationPlan } from "../../src/planner/build-plan.js";
import { buildRecommendedManifest } from "../../src/manifest/defaults.js";

describe("output contract verification", () => {
  const allTargetsManifest = buildRecommendedManifest({
    name: "test-project",
    framework: "react",
  });
  // Enable all targets
  allTargetsManifest.targets = {
    codex: true,
    copilot: true,
    claude: true,
    mcp: true,
    cursor: true,
    windsurf: true,
  };

  it("cursor target generates exactly 4 rule files", () => {
    const cursorEntries = OUTPUT_MAP.filter(
      (e) => e.target === "cursor" && e.applies(allTargetsManifest),
    );
    const paths = cursorEntries.map((e) => e.path).sort();
    expect(paths).toEqual([
      ".cursor/rules/code-review.mdc",
      ".cursor/rules/coding-style.mdc",
      ".cursor/rules/context.mdc",
      ".cursor/rules/framework.mdc",
    ]);
  });

  it("windsurf target generates exactly 4 rule files", () => {
    const windsurfEntries = OUTPUT_MAP.filter(
      (e) => e.target === "windsurf" && e.applies(allTargetsManifest),
    );
    const paths = windsurfEntries.map((e) => e.path).sort();
    expect(paths).toEqual([
      ".windsurf/rules/code-review.md",
      ".windsurf/rules/coding-style.md",
      ".windsurf/rules/context.md",
      ".windsurf/rules/framework.md",
    ]);
  });

  it("mcp target marks both outputs as trust-sensitive", () => {
    const mcpEntries = OUTPUT_MAP.filter(
      (e) => e.target === "mcp" && e.applies(allTargetsManifest),
    );
    expect(mcpEntries.every((e) => e.trustSensitive)).toBe(true);
  });

  it("cursor and windsurf outputs are not trust-sensitive", () => {
    const entries = OUTPUT_MAP.filter(
      (e) =>
        (e.target === "cursor" || e.target === "windsurf") &&
        e.applies(allTargetsManifest),
    );
    expect(entries.every((e) => !e.trustSensitive)).toBe(true);
  });

  it("every OUTPUT_MAP entry has a valid target", () => {
    const validTargets = new Set([
      "codex",
      "copilot",
      "claude",
      "mcp",
      "cursor",
      "windsurf",
      "shared",
    ]);
    for (const entry of OUTPUT_MAP) {
      expect(validTargets.has(entry.target)).toBe(true);
    }
  });

  it("plan includes all target base files when all targets enabled", () => {
    const plan = buildGenerationPlan(allTargetsManifest);
    const basePaths = plan.files
      .filter((f) => f.layer === "base")
      .map((f) => f.path)
      .sort();

    expect(basePaths).toContain("AGENTS.md");
    expect(basePaths).toContain(".github/copilot-instructions.md");
    expect(basePaths).toContain(".claude/README.md");
    expect(basePaths).toContain(".mcp.json");
    expect(basePaths).toContain(".cursor/rules/context.mdc");
    expect(basePaths).toContain(".windsurf/rules/context.md");
  });
});
