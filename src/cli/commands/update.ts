import { createRequire } from "node:module";
import { Command } from "commander";
import { runSelfUpdate } from "../version-check.js";

export function registerUpdateCommand(program: Command): void {
  program
    .command("update")
    .description("Update agenv-cli to the latest version from npm.")
    .action(async () => {
      const require = createRequire(import.meta.url);
      const pkg = require("../../../package.json") as { version: string };

      console.log(`Current version: ${pkg.version}`);
      console.log("Updating agenv-cli to latest…\n");

      try {
        await runSelfUpdate();
        console.log("\n✅ agenv-cli updated successfully.");
      } catch {
        console.error("\n❌ Update failed. Try manually: npm install -g agenv-cli@latest");
        process.exitCode = 1;
      }
    });
}
