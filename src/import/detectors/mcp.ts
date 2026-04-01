import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding, ImportUnsupported } from "../index.js";
import { isRecord } from "../../utils/json.js";

export async function detectMcp(cwd: string): Promise<DetectorResult> {
  const filePath = join(cwd, ".mcp.json");
  let raw: string;

  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return { findings: [], warnings: [], unsupported: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const unsupported: ImportUnsupported[] = [
      { source: "mcp", path: ".mcp.json", reason: "File is not valid JSON." },
    ];
    return { findings: [], warnings: [], unsupported };
  }

  const findings: ImportFinding[] = [];

  if (isRecord(parsed) && isRecord(parsed["mcpServers"])) {
    const servers = parsed["mcpServers"] as Record<string, unknown>;
    if (Object.keys(servers).length > 0) {
      findings.push({
        source: "mcp",
        path: ".mcp.json",
        field: "targets.mcp",
        confidence: "high",
        value: true,
        note: `Found servers: ${Object.keys(servers).join(", ")}`,
      });
    }
  }

  return { findings, warnings: [], unsupported: [] };
}
