import { Command } from "commander";
import { getExplanation } from "../../doctor/explain.js";
import { applyFixes } from "../../doctor/fixes.js";
import { runDoctor } from "../../doctor/run.js";
import { formatCommandOutput, formatTextBlock, parseCommaList } from "../../utils/format.js";

type DoctorOptions = {
  json?: boolean;
  strict?: boolean;
  ci?: boolean;
  targets?: string;
  fix?: boolean;
  explain?: string;
};

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Validate the current manifest and repo compatibility.")
    .option("--json", "emit machine-readable output")
    .option("--strict", "treat warnings as blocking")
    .option("--ci", "CI mode: JSON output, exit non-zero on errors or warnings")
    .option("--targets <list>", "reserved for future target-specific checks")
    .option("--fix", "automatically fix autofixable findings")
    .option("--explain <code>", "show detailed explanation for a finding code")
    .action(async (options: DoctorOptions) => {
      if (options.explain) {
        const explanation = getExplanation(options.explain);
        if (!explanation) {
          process.stderr.write(`Unknown finding code: ${options.explain}\n`);
          process.exitCode = 1;
          return;
        }
        process.stdout.write(
          formatTextBlock([
            `Code: ${explanation.code}`,
            `Title: ${explanation.title}`,
            "",
            explanation.description,
            "",
            `Remediation: ${explanation.remediation}`,
          ]),
        );
        return;
      }

      const cwd = process.cwd();
      const targetFilter = parseCommaList(options.targets);
      const isCi = Boolean(options.ci);
      const result = await runDoctor(cwd, {
        strict: isCi || Boolean(options.strict),
        targets: targetFilter,
      });

      if (isCi) {
        process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      } else {
        const text = formatTextBlock([
          `Status: ${result.status}`,
          `Errors: ${result.errors.length}`,
          `Warnings: ${result.warnings.length}`,
          `Info: ${result.info.length}`,
        ]);
        process.stdout.write(formatCommandOutput(text, result, Boolean(options.json)));
      }

      if (result.status === "error") {
        process.exitCode = 1;
      }

      if (options.fix) {
        const allFindings = [...result.errors, ...result.warnings, ...result.info];
        const fixResults = await applyFixes(cwd, allFindings);
        if (fixResults.length > 0) {
          const fixLines = fixResults.map(
            (r) => `  [${r.applied ? "fixed" : "skipped"}] ${r.code}: ${r.message}`,
          );
          process.stdout.write(formatTextBlock(["", "Fixes:", ...fixLines]));
        }
      }
    });
}
