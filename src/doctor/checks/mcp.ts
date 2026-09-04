import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Manifest } from "../../manifest/schema.js";
import { getPresetById } from "../../mcp/presets.js";
import { isRecord } from "../../utils/json.js";
import type { DiagnosticFinding } from "../types.js";

export function checkMcpEnvVars(manifest: Manifest | undefined): DiagnosticFinding[] {
  if (!manifest?.targets.mcp || manifest.generated.mcpPresets.length === 0) return [];

  const results: DiagnosticFinding[] = [];
  for (const presetId of manifest.generated.mcpPresets) {
    const preset = getPresetById(presetId);
    if (!preset) continue;

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

type JsonConfig = {
  path: string;
  key: "mcpServers" | "servers";
};

function expectedJsonConfigs(manifest: Manifest): JsonConfig[] {
  return [
    ...(manifest.targets.claude ? [{ path: ".mcp.json", key: "mcpServers" as const }] : []),
    ...(manifest.targets.cursor === true
      ? [{ path: ".cursor/mcp.json", key: "mcpServers" as const }]
      : []),
    ...(manifest.targets.copilot
      ? [{ path: ".vscode/mcp.json", key: "servers" as const }]
      : []),
  ];
}

async function checkJsonConfig(cwd: string, config: JsonConfig): Promise<DiagnosticFinding[]> {
  let raw: string;
  try {
    raw = await readFile(join(cwd, config.path), "utf8");
  } catch {
    return [
      {
        severity: "warning",
        code: "mcp_config_missing",
        message: `${config.path} not found. Run \`agenv generate\` to create it.`,
        path: config.path,
      },
    ];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [
      {
        severity: "error",
        code: "mcp_config_invalid_json",
        message: `${config.path} contains invalid JSON.`,
        path: config.path,
      },
    ];
  }

  if (!isRecord(parsed)) {
    return [
      {
        severity: "error",
        code: "mcp_config_missing_servers",
        message: `${config.path} is missing required "${config.key}" object.`,
        path: config.path,
      },
    ];
  }

  const serverCollection = parsed[config.key];
  if (!isRecord(serverCollection)) {
    return [
      {
        severity: "error",
        code: "mcp_config_missing_servers",
        message: `${config.path} is missing required "${config.key}" object.`,
        path: config.path,
      },
    ];
  }

  const results: DiagnosticFinding[] = [];
  for (const [serverId, serverConfig] of Object.entries(serverCollection)) {
    if (!isRecord(serverConfig)) {
      results.push({
        severity: "error",
        code: "mcp_server_invalid",
        message: `MCP server "${serverId}" in ${config.path} must be an object.`,
        path: config.path,
      });
      continue;
    }
    if (!("command" in serverConfig) && !("url" in serverConfig)) {
      results.push({
        severity: "error",
        code: "mcp_server_missing_transport",
        message: `MCP server "${serverId}" in ${config.path} needs a command or URL.`,
        path: config.path,
      });
    }
  }
  return results;
}

async function checkCodexConfig(cwd: string): Promise<DiagnosticFinding[]> {
  const configPath = ".codex/config.toml";
  let raw: string;
  try {
    raw = await readFile(join(cwd, configPath), "utf8");
  } catch {
    return [
      {
        severity: "warning",
        code: "mcp_config_missing",
        message: `${configPath} not found. Run \`agenv generate\` to create it.`,
        path: configPath,
      },
    ];
  }

  if (!/^\[mcp_servers(?:\."?[^\]]+"?)?\]$/m.test(raw)) {
    return [
      {
        severity: "error",
        code: "mcp_config_missing_servers",
        message: `${configPath} does not contain any [mcp_servers.<name>] tables.`,
        path: configPath,
      },
    ];
  }

  return [];
}

export async function checkMcpConfigFormat(
  cwd: string,
  manifest: Manifest | undefined,
): Promise<DiagnosticFinding[]> {
  if (!manifest?.targets.mcp) return [];

  const checks = expectedJsonConfigs(manifest).map((config) => checkJsonConfig(cwd, config));
  if (manifest.targets.codex) checks.push(checkCodexConfig(cwd));

  if (checks.length === 0) {
    return [
      {
        severity: "warning",
        code: "mcp_no_project_scoped_host",
        message: "MCP is enabled, but none of the selected targets has a generated project-scoped MCP format.",
      },
    ];
  }

  return (await Promise.all(checks)).flat();
}
