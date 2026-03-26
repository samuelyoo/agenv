import { describe, expect, it } from "vitest";
import { parseCommaList } from "../../../src/utils/format.js";

describe("CLI generate flag parsing", () => {
  describe("parseCommaList", () => {
    it("splits comma-separated values", () => {
      expect(parseCommaList("codex,claude,mcp")).toEqual(["codex", "claude", "mcp"]);
    });

    it("returns empty array for undefined", () => {
      expect(parseCommaList(undefined)).toEqual([]);
    });

    it("trims whitespace around values", () => {
      expect(parseCommaList(" codex , claude ")).toEqual(["codex", "claude"]);
    });

    it("returns single-element array for single value", () => {
      expect(parseCommaList("copilot")).toEqual(["copilot"]);
    });

    it("deduplicates repeated values", () => {
      expect(parseCommaList("codex,codex,claude")).toEqual(["codex", "claude"]);
    });

    it("filters empty segments", () => {
      expect(parseCommaList("codex,,claude,")).toEqual(["codex", "claude"]);
    });

    it("returns empty array for empty string", () => {
      expect(parseCommaList("")).toEqual([]);
    });
  });
});
