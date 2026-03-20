import type { Manifest } from "../../manifest/schema.js";
import type { GenerationPlan, PlannedFile } from "../../planner/build-plan.js";
import { formatJson } from "../../utils/json.js";
import type { Adapter, RenderedFile, SupportResult } from "../types.js";

function supports(manifest: Manifest): SupportResult {
  return {
    supported: manifest.targets.claude,
    issues: manifest.targets.claude
      ? []
      : [
          {
            severity: "warning",
            code: "claude_target_disabled",
            message: "Claude output is disabled in the manifest targets.",
          },
        ],
  };
}

function plan(_manifest: Manifest, generationPlan: GenerationPlan): PlannedFile[] {
  return generationPlan.files.filter((file) => file.target === "claude");
}

function describeProjectType(manifest: Manifest): string {
  if (manifest.project.type === "web-app") return "web application";
  if (manifest.project.type === "api-service") return "API service";
  return "dashboard";
}

function renderReadme(manifest: Manifest): string {
  const enabledTargets = Object.entries(manifest.targets)
    .filter(([, enabled]) => enabled)
    .map(([target]) => target);

  const sections = [
    `# Claude Workspace`,
    ``,
    `## Project`,
    ``,
    `- **Name:** ${manifest.project.name}`,
    `- **Type:** ${describeProjectType(manifest)}`,
    `- **Framework:** ${manifest.project.framework}`,
    `- **Language:** TypeScript`,
    `- **Targets:** ${enabledTargets.join(", ")}`,
    ``,
  ];

  if (manifest.conventions.accessibility || manifest.conventions.responsive) {
    sections.push(`## Conventions`, ``);
    if (manifest.conventions.accessibility) {
      sections.push(`- Accessibility is required. Use semantic HTML and ARIA attributes.`);
    }
    if (manifest.conventions.responsive) {
      sections.push(`- Responsive layouts are required.`);
    }
    if (manifest.conventions.authModel && manifest.conventions.authModel !== "none") {
      sections.push(`- Auth model: ${manifest.conventions.authModel}`);
    }
    sections.push(``);
  }

  sections.push(
    `## Coding Style`,
    ``,
    ...manifest.instructions.codingStyle.map((rule) => `- ${rule}`),
    ``,
    `## Review Rules`,
    ``,
    ...manifest.instructions.reviewRules.map((rule) => `- ${rule}`),
    ``,
  );

  if (manifest.generated.skills || manifest.generated.agents) {
    sections.push(`## Workspace Structure`, ``);
    if (manifest.generated.skills) {
      sections.push(`- \`skills/\` — Reusable skill files for specialized implementation tasks.`);
    }
    if (manifest.generated.agents) {
      sections.push(`- \`agents/\` — Agent definitions for delegated, role-based work.`);
    }
    sections.push(``);
  }

  return `${sections.join("\n")}\n`;
}

const SKILL_DESCRIPTIONS: Record<string, { goal: string; when: string }> = {
  "build-page-shell": {
    goal: "Create or refine a page shell with layout structure, route-level organization, and responsive behavior.",
    when: "a route needs the overall frame, header, navigation, and page-level loading/empty states.",
  },
  "build-data-table": {
    goal: "Build a data table with sorting, filtering, pagination, and accessible keyboard navigation.",
    when: "the page needs a structured data grid with interactive column behavior.",
  },
  "build-filter-panel": {
    goal: "Build a filter panel that coordinates with data views and preserves state across navigation.",
    when: "users need to narrow results by multiple criteria.",
  },
  "build-kpi-cards": {
    goal: "Build KPI cards that display metrics with loading, error, and empty states.",
    when: "the page needs a quick summary of key metrics.",
  },
  "build-chart-section": {
    goal: "Build a chart section with proper data transformation, responsive sizing, and accessibility labels.",
    when: "the page needs visual data representation.",
  },
  "connect-api-resource": {
    goal: "Connect a UI view to an API resource with proper loading, caching, error handling, and retry logic.",
    when: "a component needs to fetch, display, and manage remote data.",
  },
  "build-form-flow": {
    goal: "Build a form with validation, error display, submission handling, and success/failure states.",
    when: "users need to create or edit structured data.",
  },
  "handle-loading-empty-error-states": {
    goal: "Audit and implement loading, empty, partial, stale, retry, and failure states across the user journey.",
    when: "a feature has async data and needs robust state handling.",
  },
  "enforce-accessibility-and-responsive-layout": {
    goal: "Audit and fix accessibility and responsive layout issues.",
    when: "a feature needs to pass accessibility review or support multiple viewports.",
  },
  "write-dashboard-tests": {
    goal: "Write unit and integration tests for dashboard components and data flows.",
    when: "a feature needs test coverage for interactions, data loading, and edge cases.",
  },
};

const AGENT_DESCRIPTIONS: Record<string, { role: string; focus: string }> = {
  "ui-builder": {
    role: "Build and refine UI components following the project's design system and conventions.",
    focus: "Component structure, styling, responsive behavior, and accessibility.",
  },
  "data-integrator": {
    role: "Connect UI components to data sources with proper caching, error handling, and state management.",
    focus: "API integration, data transformation, loading states, and cache invalidation.",
  },
  "table-specialist": {
    role: "Build and optimize data tables with sorting, filtering, pagination, and row interactions.",
    focus: "Table performance, column configuration, virtualization, and keyboard navigation.",
  },
  "chart-specialist": {
    role: "Build charts and data visualizations with responsive sizing and accessible labels.",
    focus: "Chart configuration, data transformation, tooltip behavior, and color accessibility.",
  },
  "form-builder": {
    role: "Build forms with schema-driven validation, error display, and multi-step flows.",
    focus: "Validation rules, field dependencies, submission handling, and accessible error messaging.",
  },
  "qa-reviewer": {
    role: "Review code for correctness, accessibility, performance, and adherence to project conventions.",
    focus: "Code review, test coverage gaps, edge-case identification, and documentation quality.",
  },
};

const KNOWN_ACRONYMS: Record<string, string> = { qa: "QA", api: "API", ui: "UI" };
function titleCase(token: string): string {
  return KNOWN_ACRONYMS[token.toLowerCase()] ?? `${token.charAt(0).toUpperCase()}${token.slice(1)}`;
}

function renderSkill(skillName: string, manifest: Manifest): string {
  const desc = SKILL_DESCRIPTIONS[skillName];
  const title = skillName.split("-").map(titleCase).join(" ");

  const sections = [
    `# ${title}`,
    ``,
    ...(desc
      ? [`## Goal`, ``, desc.goal, ``, `## When to Use`, ``, `Use this skill when ${desc.when}`, ``]
      : [`A reusable skill for ${manifest.project.name}.`, ``]),
    `## Project Context`,
    ``,
    `- Framework: ${manifest.project.framework}`,
    `- Project type: ${describeProjectType(manifest)}`,
    ``,
    `## Coding Style`,
    ``,
    ...manifest.instructions.codingStyle.map((rule) => `- ${rule}`),
    ``,
  ];

  return `${sections.join("\n")}\n`;
}

function renderAgent(agentName: string, manifest: Manifest): string {
  const desc = AGENT_DESCRIPTIONS[agentName];
  const title = agentName.split("-").map(titleCase).join(" ");

  const sections = [
    `# ${title}`,
    ``,
    ...(desc
      ? [`## Role`, ``, desc.role, ``, `## Focus`, ``, desc.focus, ``]
      : [`An agent for ${manifest.project.name}.`, ``]),
    `## Project Context`,
    ``,
    `- Framework: ${manifest.project.framework}`,
    `- Project type: ${describeProjectType(manifest)}`,
    ``,
    `## Review Rules`,
    ``,
    ...manifest.instructions.reviewRules.map((rule) => `- ${rule}`),
    ``,
  ];

  return `${sections.join("\n")}\n`;
}

function renderMarkdownForPath(file: PlannedFile, manifest: Manifest): string {
  if (file.path === ".claude/README.md") {
    return renderReadme(manifest);
  }

  if (file.path.includes("/skills/")) {
    const skillName = file.path.split("/").pop()?.replace(".md", "") ?? "skill";
    return renderSkill(skillName, manifest);
  }

  if (file.path.includes("/agents/")) {
    const agentName = file.path.split("/").pop()?.replace(".md", "") ?? "agent";
    return renderAgent(agentName, manifest);
  }

  return formatJson({
    generatedBy: "agenv",
    project: manifest.project.name,
  });
}

function render(file: PlannedFile, manifest: Manifest): RenderedFile {
  return {
    path: file.path,
    trustSensitive: file.trustSensitive,
    content: renderMarkdownForPath(file, manifest),
  };
}

export const claudeAdapter: Adapter = {
  id: "claude",
  supports,
  plan,
  render,
};
