import { resolve } from "node:path";
import { Command } from "commander";
import { validateLocalPack } from "../../packs/pack.js";

type PackOptions = {
  json?: boolean;
};

export function registerPackCommand(program: Command): void {
  program
    .command("pack <dir>")
    .description("Validate a local pack directory.")
    .option("--json", "Output JSON", false)
    .action(async (dir: string, opts: PackOptions) => {
      const packDir = resolve(process.cwd(), dir);
      const result = await validateLocalPack(packDir);

      if (opts.json === true) {
        console.log(JSON.stringify(result, null, 2));
        if (!result.valid) {
          process.exitCode = 1;
        }
        return;
      }

      if (result.valid) {
        console.log(`Pack "${result.id}" is valid.`);
        console.log(`  Name: ${result.name}`);
        console.log(`  Description: ${result.description}`);
        console.log(`  Version: ${result.version}`);
      } else {
        console.error("Pack validation failed:");
        for (const error of result.errors) {
          console.error(`  - ${error}`);
        }
        process.exitCode = 1;
      }

      if (result.warnings.length > 0) {
        console.log("\nWarnings:");
        for (const warning of result.warnings) {
          console.log(`  - ${warning}`);
        }
      }
    });
}
