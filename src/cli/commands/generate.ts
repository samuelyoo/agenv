import { Command } from "commander";
import { watch } from "node:fs";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { summarizeRenderedDiff } from "../../fs/diff.js";
import { writeRenderedFiles } from "../../fs/write.js";
import { isLockfileStale, readLockfile } from "../../install/lockfile.js";
import { loadManifest } from "../../manifest/load.js";
import { buildGenerationPlan } from "../../planner/build-plan.js";
import type { AdapterTarget, OutputLayer, OutputScope } from "../../planner/output-map.js";
import { renderPlanFiles } from "../../render/render-plan.js";
import { formatCommandOutput, formatTextBlock, parseCommaList } from "../../utils/format.js";

type GenerateOptions = {
  dryRun?: boolean;
  json?: boolean;
  force?: boolean;
  watch?: boolean;
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
  force?: boolean;
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

  const lockfile = await readLockfile(options.cwd);
  const lockfileStale = lockfile !== undefined && isLockfileStale(manifest, lockfile);

  const plan = buildGenerationPlan(
    manifest,
    compactObject({
      targets: options.targets,
      layers: options.layers,
      scopes: options.scopes,
    }),
  );

  if (lockfileStale) {
    plan.warnings.push({
      severity: "warning",
      code: "lockfile_stale",
      message: "Lockfile is out of date. Run `agenv install` to update.",
    });
  }

  const renderedFiles = renderPlanFiles(manifest, plan);
  const summary = options.dryRun
    ? await summarizeRenderedDiff(options.cwd, renderedFiles)
    : await writeRenderedFiles(options.cwd, renderedFiles, { force: options.force });

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
    .option("--force", "overwrite files modified outside agenv")
    .option("--watch", "watch manifest for changes and regenerate")
    .option("--targets <list>", "limit generation to selected targets")
    .option("--layer <list>", "limit generation to selected layers")
    .option("--scope <list>", "limit generation to shared or local scope")
    .action(async (options: GenerateOptions) => {
      const result = await runGenerate({
        cwd: process.cwd(),
        dryRun: Boolean(options.dryRun),
        force: Boolean(options.force),
        ...compactObject({
          targets: parseTargets(options.targets),
          layers: parseLayers(options.layer),
          scopes: parseScopes(options.scope),
        }),
      });

      const skippedCount = "skipped" in result.summary ? result.summary.skipped.length : result.summary.skip.length;
      const skippedList = "skipped" in result.summary ? result.summary.skipped : result.summary.skip;
      const backedUpCount = "backedUp" in result.summary ? result.summary.backedUp.length : 0;

      const lines = [
        `Manifest: ${result.manifestPath}`,
        `Planned files: ${result.plan.files.length}`,
        `Warnings: ${result.plan.warnings.length}`,
        `Created: ${"created" in result.summary ? result.summary.created.length : result.summary.create.length}`,
        `Updated: ${"updated" in result.summary ? result.summary.updated.length : result.summary.update.length}`,
        `Unchanged: ${result.summary.unchanged.length}`,
        `Skipped: ${skippedCount}`,
      ];

      if (backedUpCount > 0) {
        lines.push(`Backed up: ${backedUpCount}`);
      }

      if (skippedCount > 0 && !result.dryRun) {
        lines.push("");
        lines.push("Skipped files (modified outside agenv):");
        for (const path of skippedList) {
          lines.push(`  ${path}`);
        }
        lines.push('Use --force to overwrite these files.');
      }

      if (result.dryRun) {
        lines.push("Dry run only: files were not written.");
      } else if (skippedCount > 0) {
        lines.push("Files written with some files skipped (modified outside agenv).");
      } else {
        lines.push("Files written successfully.");
      }

      const text = formatTextBlock(lines);

      process.stdout.write(formatCommandOutput(text, result, Boolean(options.json)));

      if (options.watch) {
        const cwd = process.cwd();
        const manifestCandidates = [
          "ai-workspace.json",
          "ai-workspace.yaml",
          "ai-workspace.yml",
          "ai-workspace.local.json",
          "ai-workspace.local.yaml",
          "ai-workspace.local.yml",
        ];

        const watchPaths: string[] = [];
        for (const candidate of manifestCandidates) {
          const fullPath = join(cwd, candidate);
          try {
            await access(fullPath);
            watchPaths.push(fullPath);
          } catch {
            // file doesn't exist, skip
          }
        }

        if (watchPaths.length === 0) {
          process.stderr.write("No manifest files found to watch.\n");
          return;
        }

        process.stdout.write(`\nWatching ${watchPaths.length} manifest file(s) for changes...\n\n`);

        let debounceTimer: ReturnType<typeof setTimeout> | undefined;

        for (const watchPath of watchPaths) {
          watch(watchPath, () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
              try {
                process.stdout.write(
                  `\n[${new Date().toLocaleTimeString()}] Manifest changed, regenerating...\n`,
                );
                const watchResult = await runGenerate({
                  cwd,
                  force: Boolean(options.force),
                  ...compactObject({
                    targets: parseTargets(options.targets),
                    layers: parseLayers(options.layer),
                    scopes: parseScopes(options.scope),
                  }),
                });
                process.stdout.write(`Generated ${watchResult.plan.files.length} files.\n`);
              } catch (error) {
                process.stderr.write(
                  `Regeneration failed: ${error instanceof Error ? error.message : String(error)}\n`,
                );
              }
            }, 300);
          });
        }

        // Keep process alive
        process.stdin.resume();
      }
    });
}
