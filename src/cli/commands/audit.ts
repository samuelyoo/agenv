import { Command } from "commander";
import { runAudit } from "../../audit/index.js";
import { formatCommandOutput, formatTextBlock } from "../../utils/format.js";

type AuditOptions = {
  json?: boolean;
  strict?: boolean;
};

export function registerAuditCommand(program: Command): void {
  program
    .command("audit")
    .description("Run security and ownership audit on the current workspace.")
    .option("--json", "emit machine-readable output")
    .option("--strict", "treat warnings as errors")
    .action(async (options: AuditOptions) => {
      const cwd = process.cwd();
      const result = await runAudit(cwd);

      const isStrict = Boolean(options.strict);
      const hasErrors = result.findings.some((f) => f.severity === "error");
      const hasWarnings = result.findings.some((f) => f.severity === "warning");

      if (Boolean(options.json)) {
        process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      } else {
        const lines = [
          `Status: ${result.status}`,
          `Findings: ${result.findings.length}`,
          `Owned files: ${result.ownership.entries.length}`,
        ];

        if (result.findings.length > 0) {
          lines.push("");
          for (const f of result.findings) {
            lines.push(`  [${f.severity}] ${f.code}: ${f.message}`);
          }
        }

        process.stdout.write(formatCommandOutput(formatTextBlock(lines), result, false));
      }

      if (hasErrors || (isStrict && hasWarnings)) {
        process.exitCode = 1;
      }
    });
}
