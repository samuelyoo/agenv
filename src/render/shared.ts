import { basename } from "node:path";
import { formatJson } from "../utils/json.js";
import type { Manifest } from "../manifest/schema.js";
import type { PlannedFile } from "../planner/build-plan.js";
import type { RenderedFile } from "../adapters/types.js";

function renderArchitectureDoc(manifest: Manifest): string {
  const enabledTargets = Object.entries(manifest.targets)
    .filter(([, enabled]) => enabled)
    .map(([target]) => target);

  return `# AI Architecture\n\n## Project\n\n- Name: ${manifest.project.name}\n- Type: ${manifest.project.type}\n- Framework: ${manifest.project.framework}\n- Language: ${manifest.project.language}\n\n## Setup\n\n- Depth: ${manifest.setup.depth}\n- Mode: ${manifest.setup.mode}\n- Scope: ${manifest.setup.scope}\n\n## Targets\n\n${enabledTargets.map((target) => `- ${target}`).join("\n")}\n\n## Coding Style\n\n${manifest.instructions.codingStyle.map((rule) => `- ${rule}`).join("\n")}\n\n## Review Rules\n\n${manifest.instructions.reviewRules.map((rule) => `- ${rule}`).join("\n")}\n`;
}

function renderBootstrapPrompt(manifest: Manifest): string {
  return `# Bootstrap Prompt\n\nYou are helping with the ${manifest.project.name} ${manifest.project.framework} dashboard repository.\n\nFollow these conventions:\n\n${manifest.instructions.codingStyle.map((rule) => `- ${rule}`).join("\n")}\n\nReview with these rules:\n\n${manifest.instructions.reviewRules.map((rule) => `- ${rule}`).join("\n")}\n`;
}

function renderPromptIndex(manifest: Manifest): string {
  return `# AI Prompts\n\nPrompt generation mode: ${manifest.generated.prompts}\n\nUse these prompts as reusable starting points for common dashboard implementation tasks.\n`;
}

function renderPromptStub(file: PlannedFile, manifest: Manifest): string {
  const promptName = basename(file.path, ".md");

  return `# ${promptName}\n\nPrompt scaffold for ${manifest.project.name}.\n\nFocus on ${promptName.replaceAll("-", " ")} while preserving the shared dashboard conventions.\n`;
}

function renderEnvExample(manifest: Manifest): string {
  const presetLines =
    manifest.generated.mcpPresets.length === 0
      ? ["EXAMPLE_API_KEY=replace-me"]
      : manifest.generated.mcpPresets.map(
          (preset) => `${preset.toUpperCase().replaceAll(/[^A-Z0-9]+/g, "_")}_TOKEN=replace-me`,
        );

  return `${presetLines.join("\n")}\n`;
}

function renderLocalManifest(): string {
  return formatJson({});
}

export function renderSharedFile(file: PlannedFile, manifest: Manifest): RenderedFile {
  switch (file.path) {
    case "ai-workspace.json":
      return {
        path: file.path,
        content: formatJson(manifest),
        trustSensitive: file.trustSensitive,
      };
    case "ai-workspace.local.json":
      return {
        path: file.path,
        content: renderLocalManifest(),
        trustSensitive: file.trustSensitive,
      };
    case "docs/ai-architecture.md":
      return {
        path: file.path,
        content: renderArchitectureDoc(manifest),
        trustSensitive: file.trustSensitive,
      };
    case "docs/ai-prompts/bootstrap.md":
      return {
        path: file.path,
        content: renderBootstrapPrompt(manifest),
        trustSensitive: file.trustSensitive,
      };
    case "docs/ai-prompts/README.md":
      return {
        path: file.path,
        content: renderPromptIndex(manifest),
        trustSensitive: file.trustSensitive,
      };
    case ".env.example":
      return {
        path: file.path,
        content: renderEnvExample(manifest),
        trustSensitive: file.trustSensitive,
      };
    default:
      return {
        path: file.path,
        content: renderPromptStub(file, manifest),
        trustSensitive: file.trustSensitive,
      };
  }
}
