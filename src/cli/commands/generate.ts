import { Command } from "commander";
import { summarizeRenderedDiff } from "../../fs/diff.js";
import { writeRenderedFiles } from "../../fs/write.js";
import { loadManifest } from "../../manifest/load.js";
import { buildGenerationPlan } from "../../planner/build-plan.js";
import type { AdapterTarget, OutputLayer, OutputScope } from "../../planner/output-map.js";
import { renderPlanFiles } from "../../render/render-plan.js";
import { formatCommandOutput, formatTextBlock, parseCommaList } from "../../utils/format.js";

type GenerateOptions = {
  dryRun?: boolean;
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

export type RunGenerateOptions = {
  cwd: string;
  dryRun?: boolean;
  targets?: AdapterTarget[] | undefined;
  layers?: OutputLayer[] | undefined;
  scopes?: OutputScope[] | undefined;
};

export type RunGenerateResult = {
  command: "generate";
  manifestPath: string;
  plan: ReturnType<typeof buildGenerationPlan>;
  summary: Awaited<ReturnType<typeof summarizeRenderedDiff>> | Awaited<ReturnType<typeof writeRenderedFiles>>;
  dryRun: boolean;
};

export async function runGenerate(options: RunGenerateOptions): Promise<RunGenerateResult> {
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
  const summary = options.dryRun
    ? await summarizeRenderedDiff(options.cwd, renderedFiles)
    : await writeRenderedFiles(options.cwd, renderedFiles);

  return {
    command: "generate",
    manifestPath: sharedPath,
    plan,
    summary,
    dryRun: Boolean(options.dryRun),
  };
}

export function registerGenerateCommand(program: Command): void {
  program
    .command("generate")
    .description("Load a manifest and compute the generation plan.")
    .option("--dry-run", "plan without writing files")
    .option("--json", "emit machine-readable output")
    .option("--targets <list>", "limit generation to selected targets")
    .option("--layer <list>", "limit generation to selected layers")
    .option("--scope <list>", "limit generation to shared or local scope")
    .action(async (options: GenerateOptions) => {
      const result = await runGenerate({
        cwd: process.cwd(),
        dryRun: Boolean(options.dryRun),
        ...compactObject({
          targets: parseTargets(options.targets),
          layers: parseLayers(options.layer),
          scopes: parseScopes(options.scope),
        }),
      });

      const text = formatTextBlock([
        `Manifest: ${result.manifestPath}`,
        `Planned files: ${result.plan.files.length}`,
        `Warnings: ${result.plan.warnings.length}`,
        `Created: ${"created" in result.summary ? result.summary.created.length : result.summary.create.length}`,
        `Updated: ${"updated" in result.summary ? result.summary.updated.length : result.summary.update.length}`,
        `Unchanged: ${result.summary.unchanged.length}`,
        `Skipped: ${"skipped" in result.summary ? result.summary.skipped.length : result.summary.skip.length}`,
        result.dryRun ? "Dry run only: files were not written." : "Files written successfully.",
      ]);

      process.stdout.write(formatCommandOutput(text, result, Boolean(options.json)));
    });
}
