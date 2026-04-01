import { computeManifestHash, isLockfileStale } from "../install/lockfile.js";
import type { Lockfile } from "../install/lockfile.js";
import type { Manifest } from "../manifest/schema.js";
import { getPresetById } from "../mcp/presets.js";
import type { DiagnosticFinding } from "../doctor/types.js";

const DANGEROUS_PRESET_IDS = new Set(["filesystem", "puppeteer"]);

export function checkMcpTrustLevels(manifest: Manifest): DiagnosticFinding[] {
  const findings: DiagnosticFinding[] = [];

  for (const presetId of manifest.generated.mcpPresets) {
    const preset = getPresetById(presetId);
    if (!preset) continue;

    if (preset.trustLevel === "dangerous") {
      findings.push({
        severity: "warning",
        code: "mcp_trust_dangerous",
        message: `MCP preset "${preset.id}" has trust level "dangerous" and should be carefully reviewed.`,
        remediation: `Review the "${preset.id}" preset configuration and ensure it is necessary for your workflow.`,
      });
    } else if (preset.trustLevel === "review") {
      findings.push({
        severity: "info",
        code: "mcp_trust_review",
        message: `MCP preset "${preset.id}" has trust level "review".`,
        remediation: `Confirm that the "${preset.id}" preset is configured with appropriate credentials and permissions.`,
      });
    }
  }

  return findings;
}

export function checkMissingEnvVars(manifest: Manifest): DiagnosticFinding[] {
  const findings: DiagnosticFinding[] = [];

  for (const presetId of manifest.generated.mcpPresets) {
    const preset = getPresetById(presetId);
    if (!preset) continue;

    for (const [key, value] of Object.entries(preset.env)) {
      if (typeof value === "string" && value.includes("${")) {
        findings.push({
          severity: "warning",
          code: "mcp_env_placeholder",
          message: `MCP preset "${preset.id}" requires environment variable "${key}" which uses a placeholder value.`,
          remediation: `Set the "${key}" environment variable before running the "${preset.id}" MCP server.`,
        });
      }
    }
  }

  return findings;
}

export function checkDangerousPatterns(manifest: Manifest): DiagnosticFinding[] {
  const findings: DiagnosticFinding[] = [];

  for (const presetId of manifest.generated.mcpPresets) {
    if (DANGEROUS_PRESET_IDS.has(presetId)) {
      findings.push({
        severity: "warning",
        code: "mcp_dangerous_pattern",
        message: `MCP preset "${presetId}" grants broad system access and poses a command injection risk.`,
        remediation: `Consider whether "${presetId}" is strictly necessary. If so, restrict its scope to the minimum required paths or resources.`,
      });
    }
  }

  return findings;
}

export function checkLockfileFreshness(
  manifest: Manifest,
  lockfile: Lockfile | undefined,
): DiagnosticFinding[] {
  const packs = manifest.packs ?? [];
  if (packs.length === 0) {
    return [];
  }

  if (lockfile === undefined) {
    return [
      {
        severity: "warning",
        code: "lockfile_missing",
        message: "Packs are configured but no lockfile exists. Run `agenv install` to create one.",
        remediation: "Run `agenv install` to resolve packs and generate a lockfile.",
      },
    ];
  }

  if (isLockfileStale(manifest, lockfile)) {
    return [
      {
        severity: "warning",
        code: "lockfile_stale",
        message: "Lockfile is out of date. Run `agenv install` to update.",
        remediation: "Run `agenv install` to re-resolve packs and update the lockfile.",
      },
    ];
  }

  return [];
}
