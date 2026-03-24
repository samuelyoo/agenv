import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Manifest } from "../../manifest/schema.js";
import { getPresetById } from "../../mcp/presets.js";
import type { DiagnosticFinding } from "../types.js";

export function checkMcpEnvVars(manifest: Manifest | undefined): DiagnosticFinding[] {
  if (!manifest) return [];
  if (!manifest.targets.mcp || manifest.generated.mcpPresets.length === 0) return [];

  const results: DiagnosticFinding[] = [];

  for (const presetId of manifest.generated.mcpPresets) {
    const preset = getPresetById(presetId);
    if (!preset || Object.keys(preset.env).length === 0) continue;

    for (const key of Object.keys(preset.env)) {
      const value = process.env[key];
      if (!value || value.trim() === "") {
        results.push({
          severity: "warning",
          code: "mcp_env_missing",
          message: `MCP preset "${preset.name}" requires env var ${key} which is not set.`,
        });
      }
    }
  }

  return results;
}

export async function checkMcpConfigFormat(
  cwd: string,
  manifest: Manifest | undefined,
): Promise<DiagnosticFinding[]> {
  if (!manifest?.targets.mcp) return [];

  const results: DiagnosticFinding[] = [];
  const mcpPath = join(cwd, ".mcp.json");

  let raw: string;
  try {
    raw = await readFile(mcpPath, "utf8");
  } catch {
    results.push({
      severity: "warning",
      code: "mcp_config_missing",
      message: ".mcp.json not found. Run `agenv generate` to create it.",
    });
    return results;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    results.push({
      severity: "error",
      code: "mcp_config_invalid_json",
      message: ".mcp.json contains invalid JSON.",
    });
    return results;
  }

  if (typeof parsed !== "object" || parsed === null || !("mcpServers" in parsed)) {
    results.push({
      severity: "error",
      code: "mcp_config_missing_servers",
      message: '.mcp.json is missing required "mcpServers" top-level key.',
    });
    return results;
  }

  const servers = (parsed as Record<string, unknown>)["mcpServers"];
  if (typeof servers !== "object" || servers === null) {
    results.push({
      severity: "error",
      code: "mcp_config_invalid_servers",
      message: '"mcpServers" must be an object.',
    });
    return results;
  }

  for (const [serverId, serverConfig] of Object.entries(servers as Record<string, unknown>)) {
    if (typeof serverConfig !== "object" || serverConfig === null) {
      results.push({
        severity: "error",
        code: "mcp_server_invalid",
        message: `MCP server "${serverId}" config must be an object.`,
      });
      continue;
    }
    if (!("command" in serverConfig)) {
      results.push({
        severity: "error",
        code: "mcp_server_missing_command",
        message: `MCP server "${serverId}" is missing required "command" field.`,
      });
    }
  }

  return results;
}
