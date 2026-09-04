import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding } from "../index.js";

export async function detectClaude(cwd: string): Promise<DetectorResult> {
  const dirPath = join(cwd, ".claude");
  const instructionCandidates = [
    { absolute: join(cwd, "CLAUDE.md"), relative: "CLAUDE.md" },
    { absolute: join(dirPath, "CLAUDE.md"), relative: ".claude/CLAUDE.md" },
  ];
  let hasClaudeDirectory = false;

  try {
    await stat(dirPath);
    hasClaudeDirectory = true;
  } catch {
    // A root CLAUDE.md is sufficient to identify Claude Code configuration.
  }

  const findings: ImportFinding[] = [];
  let instructionFile: (typeof instructionCandidates)[number] | undefined;
  for (const candidate of instructionCandidates) {
    try {
      await stat(candidate.absolute);
      instructionFile = candidate;
      break;
    } catch {
      // Try the next supported instruction location.
    }
  }

  if (!hasClaudeDirectory && !instructionFile) {
    return { findings: [], warnings: [], unsupported: [] };
  }

  findings.push({
    source: "claude",
    path: instructionFile?.relative ?? ".claude",
    field: "targets.claude",
    confidence: "high",
    value: true,
  });

  if (instructionFile) {
    const content = await readFile(instructionFile.absolute, "utf8");
    const headingMatch = /^#\s+(.+)$/m.exec(content);
    if (headingMatch?.[1] !== undefined) {
      const name = headingMatch[1].trim();
      findings.push({
        source: "claude",
        path: instructionFile.relative,
        field: "project.name",
        confidence: "low",
        value: name,
      });
    }
  }

  return { findings, warnings: [], unsupported: [] };
}
