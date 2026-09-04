import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isRecord } from "../../utils/json.js";
import type { DetectorResult, ImportFinding, ImportUnsupported } from "../index.js";

type JsonCandidate = {
  relativePath: string;
  topLevelKey: "mcpServers" | "servers";
};

const JSON_CANDIDATES: JsonCandidate[] = [
  { relativePath: ".mcp.json", topLevelKey: "mcpServers" },
  { relativePath: ".cursor/mcp.json", topLevelKey: "mcpServers" },
  { relativePath: ".vscode/mcp.json", topLevelKey: "servers" },
];

export async function detectMcp(cwd: string): Promise<DetectorResult> {
  const findings: ImportFinding[] = [];
  const unsupported: ImportUnsupported[] = [];

  for (const candidate of JSON_CANDIDATES) {
    let raw: string;
    try {
      raw = await readFile(join(cwd, candidate.relativePath), "utf8");
    } catch {
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      unsupported.push({
        source: "mcp",
        path: candidate.relativePath,
        reason: "File is not valid JSON.",
      });
      continue;
    }

    if (!isRecord(parsed) || !isRecord(parsed[candidate.topLevelKey])) continue;
    const servers = parsed[candidate.topLevelKey] as Record<string, unknown>;
    const serverNames = Object.keys(servers);
    if (serverNames.length === 0) continue;

    findings.push({
      source: "mcp",
      path: candidate.relativePath,
      field: "targets.mcp",
      confidence: "high",
      value: true,
      note: `Found servers: ${serverNames.join(", ")}`,
    });
  }

  const codexPath = ".codex/config.toml";
  try {
    const raw = await readFile(join(cwd, codexPath), "utf8");
    const serverNames = [...raw.matchAll(/^\[mcp_servers\."?([^\]".]+)"?\]$/gm)].map(
      (match) => match[1],
    );
    if (serverNames.length > 0) {
      findings.push({
        source: "mcp",
        path: codexPath,
        field: "targets.mcp",
        confidence: "high",
        value: true,
        note: `Found servers: ${serverNames.join(", ")}`,
      });
    }
  } catch {
    // Codex MCP configuration is optional.
  }

  return { findings, warnings: [], unsupported };
}
