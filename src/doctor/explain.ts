export type Explanation = {
  code: string;
  title: string;
  description: string;
  remediation: string;
};

const EXPLANATIONS: ReadonlyMap<string, Explanation> = new Map([
  // Existing doctor codes
  [
    "manifest_missing",
    {
      code: "manifest_missing",
      title: "Manifest not found",
      description:
        "No ai-workspace.json or ai-workspace.yaml file was found in the project root. The manifest is the source of truth for all generated AI workspace files.",
      remediation: 'Run "agenv init" to create a manifest interactively.',
    },
  ],
  [
    "manifest_load_failed",
    {
      code: "manifest_load_failed",
      title: "Manifest failed to load",
      description:
        "The manifest file exists but could not be parsed or validated. This usually means the JSON or YAML is malformed, or the schema version is unsupported.",
      remediation:
        "Check the manifest file for syntax errors. Compare against the schema documented in doc/manifest-spec.md.",
    },
  ],
  [
    "framework_mismatch",
    {
      code: "framework_mismatch",
      title: "Framework mismatch",
      description:
        "The framework declared in the manifest does not match what was detected in the repository. This can lead to generated files referencing the wrong framework conventions.",
      remediation:
        'Update the manifest "project.framework" field to match the detected framework, or verify that detection is correct.',
    },
  ],
  [
    "mcp_review_required",
    {
      code: "mcp_review_required",
      title: "MCP configuration needs review",
      description:
        "MCP is enabled in the manifest targets. MCP servers can execute commands and access external services, so their configuration should be reviewed for trust-sensitive behavior.",
      remediation:
        "Review .mcp.json for trust-sensitive servers. Use agenv audit to check trust levels of configured presets.",
    },
  ],
  [
    "env_placeholders_expected",
    {
      code: "env_placeholders_expected",
      title: "Environment variable placeholders detected",
      description:
        "One or more MCP presets use environment variable placeholders like ${VAR}. These must be set before the MCP servers can function.",
      remediation:
        "Set the required environment variables in your shell or .env file before running MCP servers.",
    },
  ],
  [
    "local_override_missing",
    {
      code: "local_override_missing",
      title: "Local override file missing",
      description:
        'The manifest scope is set to "local" or "mixed" but no ai-workspace.local.json file exists. Local overrides allow per-developer customization without changing the shared manifest.',
      remediation:
        'Create an ai-workspace.local.json file, or run "agenv doctor --fix" to create an empty one automatically.',
    },
  ],
  [
    "project_name_mismatch",
    {
      code: "project_name_mismatch",
      title: "Project name mismatch",
      description:
        "The project name in the manifest does not match the repository directory name or package.json name. This may cause confusion in generated file headers.",
      remediation:
        'Update "project.name" in the manifest to match the repository or package name.',
    },
  ],
  [
    "mcp_env_missing",
    {
      code: "mcp_env_missing",
      title: "MCP environment variable missing",
      description:
        "A configured MCP preset requires an environment variable that is not currently set in the environment. The MCP server may fail to start without it.",
      remediation:
        "Set the missing environment variable in your shell, .env file, or CI secrets.",
    },
  ],
  [
    "mcp_config_missing",
    {
      code: "mcp_config_missing",
      title: "MCP config file missing",
      description:
        "MCP is enabled in the manifest but no .mcp.json file exists. The file is needed for MCP server configuration.",
      remediation: 'Run "agenv generate" to create the .mcp.json file from your manifest.',
    },
  ],
  [
    "mcp_config_invalid_json",
    {
      code: "mcp_config_invalid_json",
      title: "MCP config is not valid JSON",
      description: "The .mcp.json file exists but contains invalid JSON syntax.",
      remediation:
        "Fix the JSON syntax in .mcp.json, or regenerate it with agenv generate --force.",
    },
  ],
  [
    "mcp_config_missing_servers",
    {
      code: "mcp_config_missing_servers",
      title: "MCP config missing servers key",
      description:
        'The .mcp.json file exists but does not contain a "mcpServers" key at the top level.',
      remediation:
        'Ensure .mcp.json contains a top-level "mcpServers" object, or regenerate with agenv generate.',
    },
  ],

  // New audit codes
  [
    "mcp_trust_dangerous",
    {
      code: "mcp_trust_dangerous",
      title: "Dangerous MCP preset configured",
      description:
        'An MCP preset with trust level "dangerous" is configured. These presets grant broad system access and should be used with extreme caution.',
      remediation:
        "Review whether the dangerous preset is strictly necessary. If so, restrict its scope to the minimum required paths or resources.",
    },
  ],
  [
    "mcp_trust_review",
    {
      code: "mcp_trust_review",
      title: "MCP preset requires review",
      description:
        'An MCP preset with trust level "review" is configured. These presets access external services and should be reviewed before use.',
      remediation:
        "Confirm that the preset is configured with appropriate credentials and permissions.",
    },
  ],
  [
    "mcp_env_placeholder",
    {
      code: "mcp_env_placeholder",
      title: "MCP preset uses environment placeholder",
      description:
        "An MCP preset requires an environment variable that currently uses a ${VAR} placeholder. The variable must be set before the MCP server can function.",
      remediation:
        "Set the required environment variable in your shell or CI configuration.",
    },
  ],
  [
    "mcp_dangerous_pattern",
    {
      code: "mcp_dangerous_pattern",
      title: "MCP preset with dangerous system access",
      description:
        "An MCP preset grants broad system access (filesystem, browser automation) which poses a command injection risk.",
      remediation:
        "Consider removing the preset or restricting its scope. Document the reason if the preset is necessary.",
    },
  ],
  [
    "lockfile_missing",
    {
      code: "lockfile_missing",
      title: "Lockfile missing",
      description:
        "Packs are configured in the manifest but no ai-workspace.lock file exists. Without a lockfile, installs are not deterministic.",
      remediation:
        'Run "agenv install" to resolve packs and generate a lockfile.',
    },
  ],
  [
    "lockfile_stale",
    {
      code: "lockfile_stale",
      title: "Lockfile is stale",
      description:
        "The manifest has changed since the lockfile was last generated. The lockfile no longer reflects the current manifest state.",
      remediation:
        'Run "agenv install" to re-resolve packs and update the lockfile.',
    },
  ],
  [
    "ownership_modified",
    {
      code: "ownership_modified",
      title: "Generated file modified outside agenv",
      description:
        "A file that was generated by agenv has been modified and its generated header is missing. This may indicate manual editing or an unintended change.",
      remediation:
        'Run "agenv generate --force" to restore the file, or "agenv doctor --fix" to re-apply the header only.',
    },
  ],
  [
    "ownership_missing",
    {
      code: "ownership_missing",
      title: "Generated file missing",
      description:
        "A file that should be generated by agenv does not exist on disk. This may indicate it was deleted or that generation has not been run.",
      remediation: 'Run "agenv generate" to create the missing file.',
    },
  ],
]);

export function getExplanation(code: string): Explanation | undefined {
  return EXPLANATIONS.get(code);
}

export function getAllExplanations(): Explanation[] {
  return Array.from(EXPLANATIONS.values());
}
