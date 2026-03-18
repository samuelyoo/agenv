import { Command } from "commander";
import { inspectRepo } from "../../detect/repo-inspector.js";
import { buildRecommendedManifest } from "../../manifest/defaults.js";
import { saveManifest } from "../../manifest/save.js";
import type {
  Framework,
  ProjectType,
  PromptMode,
  SetupDepth,
  SetupMode,
  SetupScope,
} from "../../manifest/schema.js";
import { buildGenerationPlan } from "../../planner/build-plan.js";
import { ADAPTER_TARGETS } from "../../planner/output-map.js";
import { formatCommandOutput, formatTextBlock, parseCommaList } from "../../utils/format.js";

type InitOptions = {
  yes?: boolean;
  dryRun?: boolean;
  json?: boolean;
  targets?: string;
  projectType?: string;
  framework?: Framework;
  setupDepth?: SetupDepth;
  setupMode?: SetupMode;
  configScope?: SetupScope;
  prompts?: PromptMode;
};

const SUPPORTED_PROJECT_TYPES: ProjectType[] = ["dashboard", "web-app"];

function buildTargetFlags(targets?: string) {
  const selectedTargets = parseCommaList(targets);

  if (selectedTargets.length === 0) {
    return undefined;
  }

  return {
    copilot: selectedTargets.includes("copilot"),
    claude: selectedTargets.includes("claude"),
    codex: selectedTargets.includes("codex"),
    mcp: selectedTargets.includes("mcp"),
  };
}

function compactObject<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<T>;
}

function validateTargets(targets?: string): void {
  for (const target of parseCommaList(targets)) {
    if (!ADAPTER_TARGETS.includes(target as (typeof ADAPTER_TARGETS)[number])) {
      throw new Error(`Unsupported target: ${target}`);
    }
  }
}

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a canonical ai-workspace manifest from repo inspection and defaults.")
    .option("--yes", "accept recommended defaults")
    .option("--dry-run", "preview without writing files")
    .option("--json", "emit machine-readable output")
    .option("--targets <list>", "comma-separated targets such as codex,claude,copilot,mcp")
    .option("--project-type <type>", "project type: dashboard or web-app", "dashboard")
    .option("--framework <value>", "override detected framework")
    .option("--setup-depth <value>", "recommended, semi-custom, or advanced")
    .option("--setup-mode <value>", "base, skills, agents, or full")
    .option("--config-scope <value>", "shared, local, or mixed")
    .option("--prompts <value>", "none, starter, master, or pack")
    .action(async (options: InitOptions) => {
      if (!SUPPORTED_PROJECT_TYPES.includes(options.projectType as ProjectType)) {
        throw new Error("Supported project types are 'dashboard' and 'web-app'.");
      }

      validateTargets(options.targets);

      const cwd = process.cwd();
      const inspection = await inspectRepo(cwd);
      const manifest = buildRecommendedManifest({
        name: inspection.projectName,
        framework: options.framework ?? inspection.framework ?? "react",
        projectType: options.projectType as ProjectType,
        ...compactObject({
          targets: buildTargetFlags(options.targets),
          setup: compactObject({
            depth: options.setupDepth,
            mode: options.setupMode,
            scope: options.configScope,
          }),
          generated: compactObject({
            prompts: options.prompts,
          }),
        }),
      });

      const plan = buildGenerationPlan(manifest);
      const manifestPath = options.dryRun ? "ai-workspace.json" : await saveManifest(cwd, manifest);

      const text = formatTextBlock([
        `Detected framework: ${inspection.framework ?? "unknown"}`,
        `Package manager: ${inspection.packageManager ?? "unknown"}`,
        `Targets: ${Object.entries(manifest.targets)
          .filter(([, enabled]) => enabled)
          .map(([target]) => target)
          .join(", ")}`,
        `Planned files: ${plan.files.length}`,
        `Warnings: ${plan.warnings.length}`,
        options.dryRun ? "Dry run only: manifest was not written." : `Manifest written to ${manifestPath}.`,
      ]);

      const payload = {
        command: "init",
        repo: inspection,
        manifest: {
          path: "ai-workspace.json",
          created: !options.dryRun,
        },
        plan,
        dryRun: Boolean(options.dryRun),
      };

      process.stdout.write(formatCommandOutput(text, payload, Boolean(options.json)));
    });
}
