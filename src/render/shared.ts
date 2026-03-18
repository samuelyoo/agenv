import { basename } from "node:path";
import { formatJson } from "../utils/json.js";
import type { Manifest } from "../manifest/schema.js";
import type { PlannedFile } from "../planner/build-plan.js";
import { PROMPT_PACKS } from "../planner/output-map.js";
import type { RenderedFile } from "../adapters/types.js";

type PromptTemplateDefinition = {
  title: string;
  goal: string;
  useWhen: string;
  focusAreas: string[];
  deliverables: string[];
};

const PROMPT_TEMPLATE_DEFINITIONS: Record<string, PromptTemplateDefinition> = {
  "build-page-shell": {
    title: "Build Page Shell",
    goal: "Create or refine a durable page shell with clear layout structure, route-level organization, and responsive behavior.",
    useWhen: "Use this when a route needs the overall frame, header, navigation, spacing system, and page-level loading or empty states.",
    focusAreas: [
      "Define the route-level structure and the main content regions before filling in detailed widgets.",
      "Make navigation, titles, actions, and responsive breakpoints feel intentional instead of incidental.",
      "Keep loading, empty, and error states visible at the page-shell level where they affect the whole experience.",
    ],
    deliverables: [
      "The page shell implementation and any supporting layout components.",
      "A short summary of the structure decisions, responsive behavior, and state handling.",
      "Any follow-up gaps or risks that still need product or design input.",
    ],
  },
  "build-data-table": {
    title: "Build Data Table",
    goal: "Implement a production-ready data table with clear columns, sorting, filtering, pagination, and state handling.",
    useWhen: "Use this when a page needs dense data presentation, list management, or admin workflows driven by tabular data.",
    focusAreas: [
      "Model the columns, row actions, empty states, and loading behavior around the real user task.",
      "Keep filtering, sorting, and pagination predictable and easy to reason about.",
      "Preserve accessibility, keyboard behavior, and legibility for dense information.",
    ],
    deliverables: [
      "The table implementation, helpers, and any state wiring required to support it.",
      "A note describing how sorting, filtering, pagination, and row actions behave.",
      "Tests or verification steps covering the most failure-prone table interactions.",
    ],
  },
  "build-filter-panel": {
    title: "Build Filter Panel",
    goal: "Build a filter panel or filter bar that makes narrowing results fast, understandable, and reversible.",
    useWhen: "Use this when users need to refine lists, charts, dashboards, or search results with multiple controls.",
    focusAreas: [
      "Choose controls that fit the data shape and are easy to reset or inspect at a glance.",
      "Keep filter state synchronized with the page state, URL state, or request state as appropriate.",
      "Make the active filter set visible so users understand why results changed.",
    ],
    deliverables: [
      "The filter UI and any associated state/query integration.",
      "A summary of how filter state is initialized, applied, cleared, and persisted.",
      "Verification that empty, loading, and no-match states remain understandable with filters applied.",
    ],
  },
  "build-kpi-cards": {
    title: "Build KPI Cards",
    goal: "Create KPI or summary cards that surface the most important metrics clearly and credibly.",
    useWhen: "Use this when a page needs top-level metrics, health indicators, or summary snapshots before deeper detail.",
    focusAreas: [
      "Prioritize the metrics, labels, trends, and comparisons that help users orient quickly.",
      "Handle loading, stale data, missing values, and surprising values without visual confusion.",
      "Keep the card hierarchy readable on both wide and narrow screens.",
    ],
    deliverables: [
      "The KPI card components and the data formatting needed to support them.",
      "A short explanation of metric hierarchy, trend treatment, and fallback behavior.",
      "Verification that cards remain legible and accurate across representative states.",
    ],
  },
  "build-chart-section": {
    title: "Build Chart Section",
    goal: "Implement a chart section that turns data into a readable story without sacrificing accuracy or usability.",
    useWhen: "Use this when the page needs trends, comparisons, distributions, or time-series views supported by charts.",
    focusAreas: [
      "Choose chart types, labels, legends, and supporting context that match the data question being answered.",
      "Make edge cases explicit, including empty data, partial ranges, and suspicious outliers.",
      "Pair the chart with surrounding copy or summary context so users can interpret it quickly.",
    ],
    deliverables: [
      "The chart section implementation with any data adapters or formatting helpers it needs.",
      "A brief note explaining the chart choice, axis treatment, and edge-case handling.",
      "Verification that the chart stays readable and accessible across screen sizes and states.",
    ],
  },
  "connect-api-resource": {
    title: "Connect API Resource",
    goal: "Wire a UI surface to an API resource with strong typing, state handling, and clear failure behavior.",
    useWhen: "Use this when you need to fetch, mutate, cache, or normalize data from an API or backend resource.",
    focusAreas: [
      "Keep request state explicit and typed, including loading, empty, success, stale, and error states.",
      "Separate transport concerns from UI concerns so components stay easier to test and maintain.",
      "Make retry behavior, optimistic updates, and error boundaries deliberate instead of accidental.",
    ],
    deliverables: [
      "The resource integration code plus the UI wiring that consumes it.",
      "A summary of data flow, caching or invalidation behavior, and failure handling.",
      "Tests or verification steps for the most important success and failure paths.",
    ],
  },
  "build-form-flow": {
    title: "Build Form Flow",
    goal: "Implement a form flow with clear validation, submission states, and user guidance from start to finish.",
    useWhen: "Use this when the work involves data entry, editing, onboarding, configuration, or multi-step submission flows.",
    focusAreas: [
      "Design the field structure, validation, and submission lifecycle around the real user journey.",
      "Keep errors actionable and in-context, especially for async validation or server responses.",
      "Ensure the form remains usable with keyboard navigation, screen readers, and narrow viewports.",
    ],
    deliverables: [
      "The form implementation, validation schema or rules, and submission handling.",
      "A short summary of validation behavior, success handling, and failure recovery.",
      "Verification that the form behaves correctly across happy path, invalid input, and submission failure cases.",
    ],
  },
  "ui-builder": {
    title: "UI Builder",
    goal: "Design and implement cohesive UI structure that feels intentional, consistent, and maintainable.",
    useWhen: "Use this when the task spans multiple components, layout decisions, or visual hierarchy choices.",
    focusAreas: [
      "Work from page structure and information hierarchy down to component detail.",
      "Reuse existing patterns or design-system primitives before inventing new ones.",
      "Keep implementation readable so future UI changes do not require large rewrites.",
    ],
    deliverables: [
      "The relevant UI implementation and any shared components needed to support it.",
      "A summary of the composition decisions and reused patterns.",
      "Notes on any assumptions, tradeoffs, or visual follow-ups still needed.",
    ],
  },
  "data-integrator": {
    title: "Data Integrator",
    goal: "Connect application state, API resources, and presentation components into a stable user-facing flow.",
    useWhen: "Use this when the work crosses fetch logic, transformation, UI binding, and state synchronization boundaries.",
    focusAreas: [
      "Trace the data flow end to end before changing component behavior.",
      "Keep transformation logic explicit so mismatches between backend data and UI state are easy to debug.",
      "Make loading, error, and stale-data transitions predictable across the whole flow.",
    ],
    deliverables: [
      "The data integration changes across fetch, transform, and UI layers.",
      "A short explanation of state boundaries and data ownership.",
      "Verification steps that prove the integrated flow works across realistic scenarios.",
    ],
  },
  "table-specialist": {
    title: "Table Specialist",
    goal: "Refine tabular workflows for clarity, speed, and robustness in dense data experiences.",
    useWhen: "Use this when the table is the main working surface and needs careful attention to interactions and edge cases.",
    focusAreas: [
      "Optimize discoverability of sorting, filtering, row actions, and bulk actions.",
      "Protect usability in dense states with long text, many columns, or mixed row states.",
      "Keep implementation modular enough to evolve without turning the table into a monolith.",
    ],
    deliverables: [
      "Improvements to the table surface and its supporting interaction model.",
      "A summary of the interaction model and the edge cases it now covers.",
      "Verification that the table remains predictable under realistic heavy-use scenarios.",
    ],
  },
  "chart-specialist": {
    title: "Chart Specialist",
    goal: "Refine charts and surrounding data presentation so they are both analytically useful and easy to read.",
    useWhen: "Use this when data visualization is central to the task and chart quality matters as much as raw implementation.",
    focusAreas: [
      "Tune chart semantics, labels, legends, and supporting UI for the actual user question.",
      "Avoid visual noise and misleading encodings when data is sparse, skewed, or incomplete.",
      "Make sure the chart section still communicates the right story without hover interactions.",
    ],
    deliverables: [
      "The chart refinements and any supporting copy, formatting, or data-shaping changes.",
      "A note describing why the chosen visualization is a fit for the data.",
      "Verification that the visualization remains understandable across common edge cases.",
    ],
  },
  "form-builder": {
    title: "Form Builder",
    goal: "Build reliable forms that are easy to complete, validate, and recover from when something goes wrong.",
    useWhen: "Use this when forms are the primary interaction surface and need thoughtful UX plus dependable implementation.",
    focusAreas: [
      "Reduce ambiguity in labels, defaults, validation, and confirmation states.",
      "Treat async submission and server-side validation as first-class concerns.",
      "Keep forms composable so later edits do not require rewriting the entire flow.",
    ],
    deliverables: [
      "The form flow implementation and any supporting abstractions required to keep it maintainable.",
      "A brief summary of validation, error handling, and success feedback decisions.",
      "Verification steps covering both user-facing UX and implementation correctness.",
    ],
  },
  "qa-reviewer": {
    title: "QA Reviewer",
    goal: "Review an implementation for regressions, missing states, and quality gaps before it moves on.",
    useWhen: "Use this when a feature is implemented and needs a structured pass for bugs, edge cases, and verification coverage.",
    focusAreas: [
      "Look for behavior regressions, missing states, accessibility gaps, and weak error handling first.",
      "Review the code path against realistic user flows, not just the happy path.",
      "Call out concrete follow-up checks or tests when risk remains.",
    ],
    deliverables: [
      "A concise review summary ordered by the most important findings first.",
      "Clear notes on missing tests, residual risks, or behavior that still needs manual verification.",
      "If no issues are found, an explicit statement that the pass was clean plus any remaining blind spots.",
    ],
  },
};

function describeProjectType(manifest: Manifest): string {
  return manifest.project.type === "web-app" ? "web app" : "dashboard";
}

function describeProjectFocus(manifest: Manifest): string {
  if (manifest.project.type === "web-app") {
    return "Favor cohesive user journeys, responsive layouts, and reusable UI patterns that scale beyond a single page.";
  }

  return "Favor operational clarity, dense-but-readable interfaces, and explicit handling for data-heavy states and permissions.";
}

function formatBullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
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

  if (manifest.project.type === "dashboard") {
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

  return `# Bootstrap Prompt\n\nUse this prompt when starting a new task in the repository.\n\n## Project Focus\n\n${describeProjectFocus(manifest)}\n\n## Ready-To-Use Prompt\n\n${renderPromptBlock(manifest, goal, focusAreas, deliverables)}`;
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
        : "Pack mode adds specialized prompts for common implementation roles and task shapes.";

  return `# AI Prompts\n\nPrompt generation mode: ${manifest.generated.prompts}\n\n${modeSummary}\n\nUse these prompts as reusable starting points for common ${describeProjectType(manifest)} implementation tasks.\n\n## Generated Prompt Files\n\n${generatedPrompts.map((promptFile) => `- \`${promptFile}\``).join("\n")}\n\n## How To Use Them\n\n- Start with \`bootstrap.md\` when you want one prompt that captures the project context and quality bar.\n- Reach for a specialized prompt when the work is clearly about a table, chart, form, data integration, or implementation review.\n- Edit the task wording in the prompt before pasting it into another tool so it matches the exact feature you are building.\n`;
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
