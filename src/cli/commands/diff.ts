import { Command } from "commander";
import { loadManifest } from "../../manifest/load.js";
import { buildGenerationPlan } from "../../planner/build-plan.js";
import type { AdapterTarget, OutputLayer, OutputScope } from "../../planner/output-map.js";
import { formatCommandOutput, formatTextBlock, parseCommaList } from "../../utils/format.js";

type DiffOptions = {
  json?: boolean;
  targets?: string;
  layer?: string;
  scope?: string;
};

function parseTargets(value?: string): AdapterTarget[] | undefined {
  const targets = parseCommaList(value);
  return targets.length > 0 ? (targets as AdapterTarget[]) : undefined;
}

function parseLayers(value?: string): OutputLayer[] | undefined {
  const layers = parseCommaList(value);
  return layers.length > 0 ? (layers as OutputLayer[]) : undefined;
}

function parseScopes(value?: string): OutputScope[] | undefined {
  const scopes = parseCommaList(value);
  return scopes.length > 0 ? (scopes as OutputScope[]) : undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<T>;
}

export function registerDiffCommand(program: Command): void {
  program
    .command("diff")
    .description("Show what generate would plan without writing files.")
    .option("--json", "emit machine-readable output")
    .option("--targets <list>", "limit diff to selected targets")
    .option("--layer <list>", "limit diff to selected layers")
    .option("--scope <list>", "limit diff to shared or local scope")
    .action(async (options: DiffOptions) => {
      const cwd = process.cwd();
      const { manifest, sharedPath } = await loadManifest(cwd);
      const plan = buildGenerationPlan(manifest, compactObject({
        targets: parseTargets(options.targets),
        layers: parseLayers(options.layer),
        scopes: parseScopes(options.scope),
      }));

      const text = formatTextBlock([
        `Manifest: ${sharedPath}`,
        `Create/update candidates: ${plan.files.length}`,
        `Warnings: ${plan.warnings.length}`,
      ]);

      const payload = {
        command: "diff",
        manifestPath: "ai-workspace.json",
        summary: plan,
      };

      process.stdout.write(formatCommandOutput(text, payload, Boolean(options.json)));
    });
}
