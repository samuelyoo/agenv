import { Command } from "commander";
import { runInstall } from "../../install/apply.js";

type InstallOptions = {
  dryRun?: boolean;
  json?: boolean;
};

export function registerInstallCommand(program: Command): void {
  program
    .command("install")
    .description("Resolve packs and write a lockfile.")
    .option("--dry-run", "Preview the install plan without writing", false)
    .option("--json", "Output JSON", false)
    .action(async (opts: InstallOptions) => {
      const cwd = process.cwd();
      const result = await runInstall(cwd, { dryRun: opts.dryRun === true });

      if (opts.json === true) {
        console.log(
          JSON.stringify(
            {
              command: "install",
              dryRun: opts.dryRun === true,
              lockfilePath: result.lockfilePath,
              plan: result.plan,
              applied: result.resolveResult.applied,
              warnings: result.resolveResult.warnings,
            },
            null,
            2,
          ),
        );
        return;
      }

      const { items } = result.plan;
      const added = items.filter((i) => i.action === "add");
      const updated = items.filter((i) => i.action === "update");
      const unchanged = items.filter((i) => i.action === "unchanged");

      if (opts.dryRun === true) {
        console.log("Install plan (dry run):\n");
      } else {
        console.log("Install complete:\n");
      }

      if (added.length > 0) {
        console.log(`  Added: ${added.map((i) => i.packId).join(", ")}`);
      }
      if (updated.length > 0) {
        console.log(`  Updated: ${updated.map((i) => i.packId).join(", ")}`);
      }
      if (unchanged.length > 0) {
        console.log(`  Unchanged: ${unchanged.map((i) => i.packId).join(", ")}`);
      }
      if (items.length === 0) {
        console.log("  No packs to install.");
      }

      if (opts.dryRun !== true) {
        console.log(`\nLockfile written to ${result.lockfilePath}`);
      }
    });
}
