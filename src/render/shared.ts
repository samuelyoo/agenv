import { basename } from "node:path";
import { formatJson } from "../utils/json.js";
import type { Manifest } from "../manifest/schema.js";
import type { PlannedFile } from "../planner/build-plan.js";
import { PROMPT_PACKS } from "../planner/output-map.js";
import type { RenderedFile } from "../adapters/types.js";
import { PROMPT_TEMPLATE_DEFINITIONS } from "./prompt-templates.js";

function describeProjectType(manifest: Manifest): string {
  if (manifest.project.type === "web-app") return "web app";
  if (manifest.project.type === "api-service") return "API service";
  return "dashboard";
}

function describeProjectFocus(manifest: Manifest): string {
  if (manifest.project.type === "web-app") {
    return "Favor cohesive user journeys, responsive layouts, and reusable UI patterns that scale beyond a single page.";
  }

  if (manifest.project.type === "api-service") {
    return "Favor clean request/response contracts, input validation at the boundary, consistent error shapes, and thin controllers delegating to well-tested service functions.";
  }

  return "Favor operational clarity, dense-but-readable interfaces, and explicit handling for data-heavy states and permissions.";
}

function buildProjectContext(manifest: Manifest): string[] {
  const enabledTargets = Object.entries(manifest.targets)
    .filter(([, enabled]) => enabled)
    .map(([target]) => target);

  const context = [
    `Project: ${manifest.project.name}`,
    `Framework: ${manifest.project.framework}`,
    `Project type: ${describeProjectType(manifest)}`,
    `Targets: ${enabledTargets.join(", ") || "none"}`,
    `Accessibility required: ${manifest.conventions.accessibility ? "yes" : "no"}`,
    `Responsive behavior required: ${manifest.conventions.responsive ? "yes" : "no"}`,
  ];

  if (manifest.conventions.authModel) {
    context.push(`Auth model: ${manifest.conventions.authModel}`);
  }

  if (manifest.project.type === "dashboard" && manifest.dashboard) {
    context.push(
      `Styling: ${manifest.dashboard.styling}`,
      `Components: ${manifest.dashboard.components}`,
      `Data fetching: ${manifest.dashboard.dataFetching}`,
      `Tables: ${manifest.dashboard.tables}`,
      `Charts: ${manifest.dashboard.charts}`,
      `Forms: ${manifest.dashboard.forms}`,
      `State: ${manifest.dashboard.state}`,
      `Testing: ${manifest.dashboard.testing.join(", ")}`,
    );
  }

  if (manifest.project.type === "api-service" && manifest.apiService) {
    context.push(
      `API style: ${manifest.apiService.apiStyle}`,
      `Validation: ${manifest.apiService.validation}`,
      `ORM: ${manifest.apiService.orm}`,
      `Auth: ${manifest.apiService.auth}`,
      `Testing: ${manifest.apiService.testing.join(", ")}`,
    );
  }

  return context;
}

function renderPromptBlock(
  manifest: Manifest,
  goal: string,
  focusAreas: string[],
  deliverables: string[],
): string {
  return [
    "```text",
    `You are working in the ${manifest.project.name} ${manifest.project.framework} ${describeProjectType(manifest)} repository.`,
    "",
    `Task: ${goal}`,
    "",
    "Project context:",
    ...buildProjectContext(manifest).map((item) => `- ${item}`),
    "",
    "Focus areas:",
    ...focusAreas.map((item) => `- ${item}`),
    "",
    "Coding style:",
    ...manifest.instructions.codingStyle.map((item) => `- ${item}`),
    "",
    "Review rules:",
    ...manifest.instructions.reviewRules.map((item) => `- ${item}`),
    "",
    "Expected deliverables:",
    ...deliverables.map((item) => `- ${item}`),
    "```",
  ].join("\n");
}

function renderArchitectureDoc(manifest: Manifest): string {
  const enabledTargets = Object.entries(manifest.targets)
    .filter(([, enabled]) => enabled)
    .map(([target]) => target);

  return `# AI Architecture\n\n## Project\n\n- Name: ${manifest.project.name}\n- Type: ${manifest.project.type}\n- Framework: ${manifest.project.framework}\n- Language: ${manifest.project.language}\n\n## Setup\n\n- Depth: ${manifest.setup.depth}\n- Mode: ${manifest.setup.mode}\n- Scope: ${manifest.setup.scope}\n\n## Targets\n\n${enabledTargets.map((target) => `- ${target}`).join("\n")}\n\n## Coding Style\n\n${manifest.instructions.codingStyle.map((rule) => `- ${rule}`).join("\n")}\n\n## Review Rules\n\n${manifest.instructions.reviewRules.map((rule) => `- ${rule}`).join("\n")}\n`;
}

function renderBootstrapPrompt(manifest: Manifest): string {
  const starterMode = manifest.generated.prompts === "starter";
  const goal = starterMode
    ? `Make steady progress on the current ${describeProjectType(manifest)} task without overcomplicating the first pass.`
    : `Plan, implement, and verify a solid solution for the current ${describeProjectType(manifest)} task.`;
  const focusAreas = starterMode
    ? [
        "Start with the smallest end-to-end slice that makes the task concrete.",
        "Keep assumptions explicit and ask for clarification only if the risk of guessing is high.",
        "Call out the next most useful follow-up after the first pass is in place.",
      ]
    : [
        "Summarize the task and identify the files, states, and risks before editing.",
        "Make changes that fit the existing architecture and reuse established patterns where possible.",
        "Verify behavior with tests or focused checks, then call out any remaining risk clearly.",
      ];
  const deliverables = starterMode
    ? [
        "A concise implementation or investigation update.",
        "The concrete file changes or recommendations that move the task forward.",
        "The next best follow-up if the work should continue.",
      ]
    : [
        "A short plan before coding when the task spans multiple files or decisions.",
        "The implementation plus any supporting tests or verification steps.",
        "A final summary covering what changed, how it was verified, and any remaining risk.",
      ];

  return `# Bootstrap Prompt\n\nUse this prompt when starting a new task in the repository.\n\nThis prompt is intentionally broad and reusable. It is the right default when you want one strong project-aware prompt without committing to a specialized workflow yet.\n\n## Project Focus\n\n${describeProjectFocus(manifest)}\n\n## Ready-To-Use Prompt\n\n${renderPromptBlock(manifest, goal, focusAreas, deliverables)}`;
}

function renderPromptIndex(manifest: Manifest): string {
  const generatedPrompts = [
    "bootstrap.md",
    ...(manifest.generated.prompts === "pack"
      ? PROMPT_PACKS.map((promptName) => `${promptName}.md`)
      : []),
  ];
  const modeSummary =
    manifest.generated.prompts === "starter"
      ? "Starter mode gives you one lightweight prompt to kick off a task."
      : manifest.generated.prompts === "master"
        ? "Master mode gives you a more structured bootstrap prompt for planning, implementation, and verification."
        : "Pack mode adds detailed best-practice prompts for common implementation roles, edge-state handling, accessibility, testing, and review flows.";

  return `# AI Prompts\n\nPrompt generation mode: ${manifest.generated.prompts}\n\n${modeSummary}\n\nUse these prompts as reusable starting points for common ${describeProjectType(manifest)} implementation tasks.\n\n## Prompt Strategy\n\n- \`starter\` and \`master\` are intentionally more generic so they stay broadly reusable.\n- \`pack\` is the more complete setup: it adds richer best-practice prompts for specialized work.\n- Use specialized prompts when you want stronger guidance around implementation quality, state handling, accessibility, testing, or review depth.\n\n## Generated Prompt Files\n\n${generatedPrompts.map((promptFile) => `- \`${promptFile}\``).join("\n")}\n\n## How To Use Them\n\n- Start with \`bootstrap.md\` when you want one prompt that captures the project context and quality bar.\n- Reach for a specialized prompt when the work is clearly about a table, chart, form, data integration, state handling, accessibility, testing, or implementation review.\n- Edit the task wording in the prompt before pasting it into another tool so it matches the exact feature you are building.\n`;
}

function renderPromptTemplate(file: PlannedFile, manifest: Manifest): string {
  const promptName = basename(file.path, ".md");
  const definition = PROMPT_TEMPLATE_DEFINITIONS[promptName];

  if (!definition) {
    const fallbackTitle = promptName
      .split("-")
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(" ");

    return `# ${fallbackTitle}\n\nUse this prompt as a starting point for work in ${manifest.project.name}.\n\n## Ready-To-Use Prompt\n\n${renderPromptBlock(
      manifest,
      `Advance the ${fallbackTitle.toLowerCase()} work while preserving the shared project conventions.`,
      [
        "Clarify the intended user outcome before changing the implementation.",
        "Reuse existing project patterns and keep state handling explicit.",
        "Explain the final behavior and verification steps clearly.",
      ],
      [
        "The implementation changes needed for the task.",
        "A short summary of the decisions made.",
        "Tests run or focused checks performed.",
      ],
    )}`;
  }

  return `# ${definition.title}\n\n${definition.useWhen}\n\n## Goal\n\n${definition.goal}\n\n## Project Focus\n\n${describeProjectFocus(manifest)}\n\n## Ready-To-Use Prompt\n\n${renderPromptBlock(
    manifest,
    definition.goal,
    definition.focusAreas,
    definition.deliverables,
  )}`;
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
        content: renderPromptTemplate(file, manifest),
        trustSensitive: file.trustSensitive,
      };
  }
}
