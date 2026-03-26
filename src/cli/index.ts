#!/usr/bin/env node

import { createRequire } from "node:module";
import { Command } from "commander";
import { isAgenvError } from "../errors.js";
import { registerDiffCommand } from "./commands/diff.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerGenerateCommand } from "./commands/generate.js";
import { registerInitCommand } from "./commands/init.js";
import { registerTemplatesListCommand } from "./commands/templates-list.js";

export function createCli(): Command {
  const require = createRequire(import.meta.url);
  const pkg = require("../../package.json") as { version: string };

  const program = new Command();

  program
    .name("agenv")
    .description(
      "Bootstrap a portable, reviewable AI workspace for web development repositories.",
    )
    .version(pkg.version);

  registerInitCommand(program);
  registerGenerateCommand(program);
  registerDiffCommand(program);
  registerDoctorCommand(program);
  registerTemplatesListCommand(program);

  return program;
}

async function main(): Promise<void> {
  const program = createCli();
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  if (isAgenvError(error)) {
    console.error(`[${error.code}] ${error.message}`);
  } else {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
  }
  process.exitCode = 1;
});
