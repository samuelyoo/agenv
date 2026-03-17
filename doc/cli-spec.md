# CLI Specification

## 1. Purpose

This document defines the command-line contract for `agenv` MVP commands:

- `agenv init`
- `agenv generate`
- `agenv diff`
- `agenv doctor`
- `agenv templates list`

It locks down command purpose, supported flags, example invocations, expected output shape, and exit-code behavior so implementation can proceed without ambiguity.

## 2. CLI conventions

### Binary and runtime

- Executable name: `agenv`
- Runtime: Node.js 20+
- Working directory: the current repository root unless `--cwd` is added in a later version

### Manifest resolution

Commands that read project configuration must resolve files in this order:

1. `ai-workspace.json`
2. `ai-workspace.local.json` if present

The local file is an override layer and must never replace the shared manifest entirely.

### Output modes

Commands may render output in two modes:

- human-readable text for interactive terminal use
- JSON summaries for automation when `--json` is supported

Human-readable output should be concise, grouped by result type, and safe to scan in CI logs.

### Common behavior

- Dry-run mode must never write files.
- Warnings must be shown before completion when trust-sensitive output is involved.
- File paths in command output should be relative to the current working directory.
- Repeated runs with unchanged inputs should produce stable output.

## 3. Exit codes

The CLI should use a small, consistent exit-code set across commands.

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Blocking runtime or validation failure |
| `2` | Invalid CLI usage or unsupported flag combination |

Additional command-specific rules are defined below, but they must still use this set.

## 4. Global flags

The MVP should support these shared flags where relevant:

| Flag | Applies to | Meaning |
| --- | --- | --- |
| `--help` | all commands | Print usage help |
| `--version` | root CLI | Print package version |
| `--json` | `init`, `generate`, `diff`, `doctor`, `templates list` | Emit structured machine-readable output |
| `--dry-run` | `init`, `generate` | Plan and render without writing |

Commands that do not support a flag must reject it with exit code `2`.

## 5. Command: `agenv init`

### Purpose

Initialize AI workspace configuration for the current repository by:

1. inspecting the repo
2. guiding the user through the dashboard-first setup flow
3. writing `ai-workspace.json`
4. optionally generating selected output files immediately

### Behavior

- Interactive by default.
- Must support a minimal-question recommended path.
- Must preview generated files and warnings before writing.
- Must be able to run fully non-interactively through flags.

### Supported flags

| Flag | Type | Meaning |
| --- | --- | --- |
| `--yes` | boolean | Accept recommended defaults and skip non-essential prompts |
| `--dry-run` | boolean | Show planned manifest and files without writing |
| `--json` | boolean | Emit plan/result as JSON |
| `--targets <list>` | comma list | Explicit targets such as `codex,claude,copilot,mcp` |
| `--project-type <type>` | string | Override detected project type; MVP supports `dashboard` |
| `--framework <value>` | string | Override detected framework |
| `--setup-depth <value>` | string | `recommended`, `semi-custom`, or `advanced` |
| `--setup-mode <value>` | string | `base`, `skills`, `agents`, or `full` |
| `--config-scope <value>` | string | `shared`, `local`, or `mixed` |
| `--prompts <value>` | string | `none`, `starter`, `master`, or `pack` |
| `--overwrite` | boolean | Allow overwrite of non-generated files after explicit user choice in non-interactive mode |

### Example usage

```bash
agenv init
agenv init --yes --targets codex,copilot,claude,mcp
agenv init --yes --framework nextjs --setup-mode full --prompts pack
agenv init --dry-run --json
```

### Human-readable output

`init` should print these sections in order:

1. repo detection summary
2. selected configuration summary
3. planned files grouped by `shared` and `local`
4. warnings
5. write result or dry-run notice

Example summary lines:

```text
Detected framework: nextjs
Targets: codex, copilot, claude, mcp
Planned files: 11
Warnings: 2
```

### JSON output

When `--json` is set, the command should emit an object shaped like:

```json
{
  "command": "init",
  "repo": {
    "framework": "nextjs",
    "packageManager": "npm"
  },
  "manifest": {
    "path": "ai-workspace.json",
    "created": true
  },
  "plan": {
    "files": [],
    "warnings": [],
    "skipped": []
  },
  "dryRun": false
}
```

### Exit-code behavior

- `0` on successful preview or successful write.
- `1` when repo inspection, manifest generation, or file write fails.
- `2` when required flag values are invalid or contradictory.

## 6. Command: `agenv generate`

### Purpose

Load an existing manifest, compute the generation plan, and write selected outputs without rerunning the wizard.

### Behavior

- Non-interactive by default.
- Must fail if no shared manifest exists.
- Must respect existing generated headers and overwrite rules.

### Supported flags

| Flag | Type | Meaning |
| --- | --- | --- |
| `--dry-run` | boolean | Render without writing |
| `--json` | boolean | Emit machine-readable summary |
| `--targets <list>` | comma list | Limit generation to selected targets |
| `--layer <list>` | comma list | Limit generation to `base`, `skills-agents`, or `prompts` |
| `--scope <value>` | string | Limit output to `shared` or `local` files |
| `--overwrite` | boolean | Allow overwrite of conflicting non-generated files |

### Example usage

```bash
agenv generate
agenv generate --targets codex,claude
agenv generate --layer prompts --dry-run
agenv generate --scope local --json
```

### Human-readable output

`generate` should show:

1. manifest path in use
2. selected filters
3. file results grouped as `created`, `updated`, `unchanged`, and `skipped`
4. warnings

### JSON output

```json
{
  "command": "generate",
  "manifestPath": "ai-workspace.json",
  "filters": {
    "targets": ["codex", "claude"],
    "layer": ["base"]
  },
  "results": {
    "created": [],
    "updated": [],
    "unchanged": [],
    "skipped": []
  },
  "warnings": [],
  "dryRun": false
}
```

### Exit-code behavior

- `0` when generation succeeds, including when no files changed.
- `1` when manifest loading, planning, rendering, or writing fails.
- `2` when filters contain unsupported values.

## 7. Command: `agenv diff`

### Purpose

Show what `generate` would change without writing files.

### Behavior

- Must never write files.
- Must compute the same plan as `generate`.
- Should summarize changes even when full unified diffs are not printed.

### Supported flags

| Flag | Type | Meaning |
| --- | --- | --- |
| `--json` | boolean | Emit structured diff summary |
| `--targets <list>` | comma list | Limit diff to selected targets |
| `--layer <list>` | comma list | Limit diff to selected layers |
| `--scope <value>` | string | Limit diff to `shared` or `local` files |
| `--unified` | boolean | Print content diff hunks for changed text files when feasible |

### Example usage

```bash
agenv diff
agenv diff --targets codex,mcp
agenv diff --layer prompts --json
```

### Human-readable output

Minimum summary categories:

- `create`
- `update`
- `unchanged`
- `skip`

If `--unified` is set, the command may also print line diffs after the summary.

### JSON output

```json
{
  "command": "diff",
  "manifestPath": "ai-workspace.json",
  "summary": {
    "create": [],
    "update": [],
    "unchanged": [],
    "skip": []
  },
  "warnings": []
}
```

### Exit-code behavior

- `0` when diff computation succeeds, regardless of whether changes exist.
- `1` when manifest loading or diff planning fails.
- `2` when invalid filters are supplied.

## 8. Command: `agenv doctor`

### Purpose

Validate the current setup and report malformed config, unsafe choices, missing placeholders, and stack mismatches.

### Behavior

- Must run without writing files.
- Must distinguish blocking issues from warnings.
- Must produce actionable messages with suggested fixes.

### Supported flags

| Flag | Type | Meaning |
| --- | --- | --- |
| `--json` | boolean | Emit structured diagnostic results |
| `--strict` | boolean | Treat warnings as blocking for CI usage |
| `--targets <list>` | comma list | Run target-specific checks only |

### Example usage

```bash
agenv doctor
agenv doctor --strict
agenv doctor --targets mcp,claude --json
```

### Human-readable output

The report should group findings by severity:

1. errors
2. warnings
3. informational checks passed

Each blocking finding should include:

- short title
- affected path or target
- explanation
- recommended fix

### JSON output

```json
{
  "command": "doctor",
  "status": "error",
  "errors": [],
  "warnings": [],
  "info": []
}
```

### Exit-code behavior

- `0` when no blocking issues exist.
- `1` when blocking issues exist, or when `--strict` is set and warnings are present.
- `2` when invalid target filters are supplied.

## 9. Command: `agenv templates list`

### Purpose

List built-in starter templates and presets available to the setup flow.

### Behavior

- Read-only command.
- Must work even before a manifest exists.
- Should clearly label MVP-supported templates versus future placeholders.

### Supported flags

| Flag | Type | Meaning |
| --- | --- | --- |
| `--json` | boolean | Emit structured template metadata |

### Example usage

```bash
agenv templates list
agenv templates list --json
```

### Human-readable output

Each template entry should include:

- template id
- display name
- intended stack
- default targets
- short description

### JSON output

```json
{
  "command": "templates list",
  "templates": [
    {
      "id": "dashboard-nextjs-recommended",
      "projectType": "dashboard",
      "framework": "nextjs",
      "setupDepth": "recommended"
    }
  ]
}
```

### Exit-code behavior

- `0` when the list is produced successfully.
- `1` when template metadata cannot be loaded.
- `2` when unsupported flags are provided.

## 10. Non-goals for the CLI contract

The MVP command contract does not require:

- shell completion
- config file discovery outside the repo
- remote template registries
- destructive commands such as delete or cleanup
- a public `upgrade` command unless later promoted from stub status
