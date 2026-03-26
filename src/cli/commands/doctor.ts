import { Command } from "commander";
import { runDoctor } from "../../doctor/run.js";
import { formatCommandOutput, formatTextBlock, parseCommaList } from "../../utils/format.js";

type DoctorOptions = {
  json?: boolean;
  strict?: boolean;
  ci?: boolean;
  targets?: string;
};

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Validate the current manifest and repo compatibility.")
    .option("--json", "emit machine-readable output")
    .option("--strict", "treat warnings as blocking")
    .option("--ci", "CI mode: JSON output, exit non-zero on errors or warnings")
    .option("--targets <list>", "reserved for future target-specific checks")
    .action(async (options: DoctorOptions) => {
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
    });
}
