import { describe, expect, it } from "vitest";
import { MCP_PRESETS, VALID_PRESET_IDS } from "../../../src/mcp/presets.js";

describe("MCP preset catalog", () => {
  it("contains only the verified 3.0 catalog", () => {
    expect(VALID_PRESET_IDS).toEqual([
      "github",
      "filesystem",
      "memory",
      "linear",
      "sentry",
      "notion",
      "stripe",
      "sequential-thinking",
    ]);
  });

  it("records provenance and a native transport for every preset", () => {
    for (const preset of MCP_PRESETS) {
      expect(preset.sourceUrl).toMatch(/^https:\/\//);
      expect(preset.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["safe", "review", "dangerous"]).toContain(preset.trustLevel);

      if (preset.transport === "http") {
        expect(preset.url).toMatch(/^https:\/\//);
      } else {
        expect(preset.command).not.toBe("");
        expect(preset.args.length).toBeGreaterThan(0);
      }
    }
  });

  it("does not expose literal secrets in built-in environment values", () => {
    for (const preset of MCP_PRESETS) {
      for (const value of Object.values(preset.env)) {
        expect(value).toMatch(/^\$\{[A-Z][A-Z0-9_]*\}$/);
      }
    }
  });
});
