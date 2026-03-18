import { Command } from "commander";
import { TEMPLATE_REGISTRY } from "../../templates/registry.js";
import { formatCommandOutput, formatTextBlock } from "../../utils/format.js";

type TemplatesListOptions = {
  json?: boolean;
};

export function registerTemplatesListCommand(program: Command): void {
  const templatesCommand = program
    .command("templates")
    .description("Template discovery commands.");

  templatesCommand
    .command("list")
    .description("List built-in starter templates.")
    .option("--json", "emit machine-readable output")
    .action((options: TemplatesListOptions) => {
      const text = formatTextBlock(
        TEMPLATE_REGISTRY.map(
          (template) =>
            `${template.id} - ${template.framework} (${template.setupDepth}) - ${template.description}`,
        ),
      );

      const payload = {
        command: "templates list",
        templates: TEMPLATE_REGISTRY,
      };

      process.stdout.write(formatCommandOutput(text, payload, Boolean(options.json)));
    });
}
