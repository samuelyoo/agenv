import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { InvalidOptionError } from "../../errors.js";
import { buildRecommendedManifest } from "../../manifest/defaults.js";
import { saveManifest } from "../../manifest/save.js";
import { runImport, IMPORT_SOURCES } from "../../import/index.js";
import { formatImportReport } from "../../import/report.js";
import { formatCommandOutput, parseCommaList } from "../../utils/format.js";
import type { ImportSource } from "../../import/index.js";

type ImportOptions = {
  json?: boolean;
  write?: boolean;
  from?: string;
};

function validateFromSources(from?: string): ImportSource[] {
  const values = parseCommaList(from);
  for (const value of values) {
    if (!IMPORT_SOURCES.includes(value as ImportSource)) {
      throw new InvalidOptionError("--from", value, [...IMPORT_SOURCES]);
    }
  }
  return values as ImportSource[];
}

export function registerImportCommand(program: Command): void {
  program
    .command("import")
    .description(
      "Scan existing AI config files and infer manifest fields from them.",
    )
    .option("--json", "emit machine-readable output")
    .option(
      "--write",
      "write a manifest from the merged import results after confirmation",
    )
    .option(
      "--from <list>",
      "comma-separated sources to scan: codex,claude,cursor,windsurf,copilot,mcp",
    )
    .action(async (options: ImportOptions) => {
      const cwd = process.cwd();
      const fromSources = validateFromSources(options.from);

      const result = await runImport(
        cwd,
        fromSources.length > 0 ? { from: fromSources } : {},
      );

      const text = formatImportReport(result.report);

      const payload = {
        command: "import",
        report: result.report,
        candidateTargets: result.candidateTargets,
        candidateProjectName: result.candidateProjectName,
        candidateFramework: result.candidateFramework,
      };

      process.stdout.write(formatCommandOutput(text, payload, Boolean(options.json)));

      if (options.write) {
        const enabledTargets = result.candidateTargets;
        const projectName = result.candidateProjectName ?? "my-project";
        const framework = result.candidateFramework ?? "react";

        const manifest = buildRecommendedManifest({
          name: projectName,
          framework,
          targets: enabledTargets,
        });

        const shouldWrite = process.stdout.isTTY
          ? await confirm({ message: "Write manifest to ai-workspace.json?" })
          : true;

        if (shouldWrite) {
          const manifestPath = await saveManifest(cwd, manifest);
          process.stdout.write(`Manifest written to ${manifestPath}.\n`);
        } else {
          process.stdout.write("Import cancelled.\n");
        }
      }
    });
}
