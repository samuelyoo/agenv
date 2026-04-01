import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding } from "../index.js";

export async function detectClaude(cwd: string): Promise<DetectorResult> {
  const dirPath = join(cwd, ".claude");

  try {
    await stat(dirPath);
  } catch {
    return { findings: [], warnings: [], unsupported: [] };
  }

  const findings: ImportFinding[] = [];

  findings.push({
    source: "claude",
    path: ".claude",
    field: "targets.claude",
    confidence: "high",
    value: true,
  });

  // Optionally extract project name from CLAUDE.md heading
  try {
    const content = await readFile(join(dirPath, "CLAUDE.md"), "utf8");
    const headingMatch = /^#\s+(.+)$/m.exec(content);
    if (headingMatch?.[1] !== undefined) {
      const name = headingMatch[1].trim();
      findings.push({
        source: "claude",
        path: ".claude/CLAUDE.md",
        field: "project.name",
        confidence: "low",
        value: name,
      });
    }
  } catch {
    // CLAUDE.md is optional; absence is not an error
  }

  return { findings, warnings: [], unsupported: [] };
}
