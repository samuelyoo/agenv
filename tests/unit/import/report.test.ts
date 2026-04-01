import { describe, expect, it } from "vitest";
import { formatImportReport } from "../../../src/import/report.js";
import type { ImportReport } from "../../../src/import/index.js";

describe("formatImportReport", () => {
  it("returns 'No import candidates found.' for an empty report", () => {
    const report: ImportReport = { findings: [], warnings: [], unsupported: [] };
    expect(formatImportReport(report)).toContain("No import candidates found.");
  });

  it("includes source name and field for a finding", () => {
    const report: ImportReport = {
      findings: [
        { source: "codex", path: "AGENTS.md", field: "targets.codex", confidence: "high", value: true },
      ],
      warnings: [],
      unsupported: [],
    };
    const output = formatImportReport(report);
    expect(output).toContain("codex");
    expect(output).toContain("targets.codex");
  });

  it("includes warning text when warnings present", () => {
    const report: ImportReport = {
      findings: [
        { source: "mcp", path: ".mcp.json", field: "targets.mcp", confidence: "high", value: true },
      ],
      warnings: ["MCP servers require manual review."],
      unsupported: [],
    };
    const output = formatImportReport(report);
    expect(output).toContain("MCP servers require manual review.");
  });

  it("includes unsupported entry reason", () => {
    const report: ImportReport = {
      findings: [],
      warnings: [],
      unsupported: [{ source: "mcp", path: ".mcp.json", reason: "File is not valid JSON." }],
    };
    const output = formatImportReport(report);
    expect(output).toContain("File is not valid JSON.");
  });
});
