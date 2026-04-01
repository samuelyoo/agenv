import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding } from "../index.js";

const FRAMEWORK_PATTERNS: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /next\.?js/i, value: "nextjs" },
  { pattern: /vite/i, value: "vite-react" },
  { pattern: /fastify/i, value: "fastify" },
  { pattern: /\bhono\b/i, value: "hono" },
  { pattern: /\bexpress\b/i, value: "express" },
  { pattern: /\breact\b/i, value: "react" },
];

function detectFrameworkFromContent(content: string): string | undefined {
  for (const { pattern, value } of FRAMEWORK_PATTERNS) {
    if (pattern.test(content)) {
      return value;
    }
  }
  return undefined;
}

export async function detectCodex(cwd: string): Promise<DetectorResult> {
  const filePath = join(cwd, "AGENTS.md");
  let content: string;

  try {
    content = await readFile(filePath, "utf8");
  } catch {
    return { findings: [], warnings: [], unsupported: [] };
  }

  const findings: ImportFinding[] = [];

  findings.push({
    source: "codex",
    path: "AGENTS.md",
    field: "targets.codex",
    confidence: "high",
    value: true,
  });

  // Extract project name from first # heading, skip if heading is literally "AGENTS"
  const headingMatch = /^#\s+(.+)$/m.exec(content);
  if (headingMatch?.[1] !== undefined) {
    const name = headingMatch[1].trim();
    if (name.toUpperCase() !== "AGENTS") {
      findings.push({
        source: "codex",
        path: "AGENTS.md",
        field: "project.name",
        confidence: "medium",
        value: name,
      });
    }
  }

  // Framework detection
  const framework = detectFrameworkFromContent(content);
  if (framework !== undefined) {
    findings.push({
      source: "codex",
      path: "AGENTS.md",
      field: "project.framework",
      confidence: "medium",
      value: framework,
    });
  }

  return { findings, warnings: [], unsupported: [] };
}
