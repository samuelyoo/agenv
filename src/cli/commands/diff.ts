import { Command } from "commander";
import { summarizeRenderedDiff } from "../../fs/diff.js";
import { loadManifest } from "../../manifest/load.js";
import { buildGenerationPlan } from "../../planner/build-plan.js";
import type { AdapterTarget, OutputLayer, OutputScope } from "../../planner/output-map.js";
import { renderPlanFiles } from "../../render/render-plan.js";
import { formatCommandOutput, formatTextBlock, parseCommaList } from "../../utils/format.js";

type DiffOptions = {
  json?: boolean;
  targets?: string;
  layer?: string;
  scope?: string;
  explain?: boolean;
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

export type RunDiffOptions = {
  cwd: string;
  targets?: AdapterTarget[] | undefined;
  layers?: OutputLayer[] | undefined;
  scopes?: OutputScope[] | undefined;
};

export type RunDiffResult = {
  command: "diff";
  manifestPath: string;
  plan: ReturnType<typeof buildGenerationPlan>;
  summary: Awaited<ReturnType<typeof summarizeRenderedDiff>>;
};

export async function runDiff(options: RunDiffOptions): Promise<RunDiffResult> {
  const { manifest, sharedPath } = await loadManifest(options.cwd);
  const plan = buildGenerationPlan(
    manifest,
    compactObject({
      targets: options.targets,
      layers: options.layers,
      scopes: options.scopes,
    }),
  );
  const renderedFiles = renderPlanFiles(manifest, plan);
  const summary = await summarizeRenderedDiff(options.cwd, renderedFiles, plan.files);

  return {
    command: "diff",
    manifestPath: sharedPath,
    plan,
    summary,
  };
}

export function registerDiffCommand(program: Command): void {
  program
    .command("diff")
    .description("Show what generate would plan without writing files.")
    .option("--json", "emit machine-readable output")
    .option("--targets <list>", "limit diff to selected targets")
    .option("--layer <list>", "limit diff to selected layers")
    .option("--scope <list>", "limit diff to shared or local scope")
    .option("--explain", "show per-file target, layer, and purpose")
    .action(async (options: DiffOptions) => {
      const result = await runDiff({
        cwd: process.cwd(),
        ...compactObject({
          targets: parseTargets(options.targets),
          layers: parseLayers(options.layer),
          scopes: parseScopes(options.scope),
        }),
      });

      const lines = [
        `Manifest: ${result.manifestPath}`,
        `Create: ${result.summary.create.length}`,
        `Update: ${result.summary.update.length}`,
        `Unchanged: ${result.summary.unchanged.length}`,
        `Skip: ${result.summary.skip.length}`,
        `Warnings: ${result.plan.warnings.length}`,
      ];

      if (options.explain) {
        lines.push("", "--- Entries ---");
        for (const entry of result.summary.entries) {
          lines.push(`  ${entry.action}  ${entry.path}  [${entry.target}/${entry.layer}] ${entry.purpose}`);
        }
      }

      const text = formatTextBlock(lines);

      process.stdout.write(formatCommandOutput(text, result, Boolean(options.json)));
    });
}
