import { describe, expect, it } from "vitest";
import { mergeFindings } from "../../../src/import/merge.js";
import type { ImportFinding } from "../../../src/import/index.js";

describe("mergeFindings", () => {
  it("applies high-confidence targets.codex true", () => {
    const findings: ImportFinding[] = [
      { source: "codex", path: "AGENTS.md", field: "targets.codex", confidence: "high", value: true },
    ];
    const result = mergeFindings(findings);
    expect(result.targets.codex).toBe(true);
  });

  it("does not apply medium-confidence targets.cursor", () => {
    const findings: ImportFinding[] = [
      { source: "cursor", path: ".cursorrules", field: "targets.cursor", confidence: "medium", value: true },
    ];
    const result = mergeFindings(findings);
    expect(result.targets.cursor).toBeUndefined();
  });

  it("applies single high-confidence project.name", () => {
    const findings: ImportFinding[] = [
      { source: "codex", path: "AGENTS.md", field: "project.name", confidence: "high", value: "MyProject" },
    ];
    const result = mergeFindings(findings);
    expect(result.projectName).toBe("MyProject");
  });

  it("resolves to undefined when two high-confidence sources disagree on project.framework", () => {
    const findings: ImportFinding[] = [
      { source: "codex", path: "AGENTS.md", field: "project.framework", confidence: "high", value: "nextjs" },
      { source: "cursor", path: ".cursorrules", field: "project.framework", confidence: "high", value: "react" },
    ];
    const result = mergeFindings(findings);
    expect(result.framework).toBeUndefined();
  });

  it("prefers high over medium for project.name", () => {
    const findings: ImportFinding[] = [
      { source: "claude", path: ".claude/CLAUDE.md", field: "project.name", confidence: "low", value: "LowName" },
      { source: "codex", path: "AGENTS.md", field: "project.name", confidence: "high", value: "HighName" },
    ];
    const result = mergeFindings(findings);
    expect(result.projectName).toBe("HighName");
  });

  it("returns undefined framework when value is not a valid Framework schema value", () => {
    const findings: ImportFinding[] = [
      { source: "codex", path: "AGENTS.md", field: "project.framework", confidence: "high", value: "angular" },
    ];
    const result = mergeFindings(findings);
    expect(result.framework).toBeUndefined();
  });
});
