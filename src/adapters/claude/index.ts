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
  if (manifest.project.type === "full-stack") return "full-stack application";
  if (manifest.project.type === "library") return "library";
  if (manifest.project.type === "cli-tool") return "CLI tool";
  if (manifest.project.type === "mobile") return "mobile application";
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

  // --- Web-App Skills ---
  "build-page-layout": {
    goal: "Create a durable page layout with clear content regions, responsive breakpoints, and consistent navigation.",
    when: "a route needs structure, content areas, header/footer, and responsive behavior.",
  },
  "build-navigation": {
    goal: "Build navigation (sidebar, top bar, breadcrumbs) with active-state tracking and responsive collapse.",
    when: "the app needs primary and secondary navigation patterns.",
  },
  "build-auth-flow": {
    goal: "Implement sign-in, sign-up, password reset, and session management flows.",
    when: "the app requires user authentication.",
  },
  "build-state-management": {
    goal: "Set up application state management with clear ownership boundaries.",
    when: "the app has shared state that crosses component boundaries.",
  },
  "build-api-integration": {
    goal: "Connect the frontend to API endpoints with typed responses, caching, and error handling.",
    when: "a feature needs to fetch or mutate remote data.",
  },
  "implement-routing": {
    goal: "Configure client-side routing with lazy loading, guards, and nested layouts.",
    when: "the app needs URL-driven navigation with route-level code splitting.",
  },
  "write-web-app-tests": {
    goal: "Write focused tests for user flows, component behavior, and integration with API boundaries.",
    when: "a feature needs automated test coverage.",
  },

  // --- API-Service Skills ---
  "design-api-endpoints": {
    goal: "Design RESTful or GraphQL endpoints with clear resource naming, status codes, and response shapes.",
    when: "a new resource or capability needs an API surface.",
  },
  "build-request-validation": {
    goal: "Implement schema-based request validation at the handler boundary.",
    when: "incoming requests need input validation before processing.",
  },
  "build-database-layer": {
    goal: "Build data access with typed queries, migrations, and connection management.",
    when: "a feature needs database reads, writes, or schema changes.",
  },
  "build-auth-middleware": {
    goal: "Implement authentication and authorization middleware with token validation.",
    when: "endpoints need to verify identity or check permissions.",
  },
  "build-error-handling": {
    goal: "Build consistent error response shapes, status code mapping, and error logging.",
    when: "the service needs structured error handling across all endpoints.",
  },
  "implement-logging": {
    goal: "Set up structured logging with request context, correlation IDs, and appropriate log levels.",
    when: "the service needs observable request/response logging.",
  },
  "write-api-tests": {
    goal: "Write integration and unit tests for handlers, services, and middleware.",
    when: "API endpoints need automated test coverage.",
  },
  "build-background-jobs": {
    goal: "Implement background job processing with retry semantics and failure handling.",
    when: "work needs to happen outside the request/response cycle.",
  },
  "configure-deployment": {
    goal: "Set up deployment configuration (Dockerfile, CI, health checks, env management).",
    when: "the service needs deployment automation.",
  },
  "document-api": {
    goal: "Generate or write API documentation with examples, authentication notes, and error catalogs.",
    when: "the API needs consumer-facing documentation.",
  },

  // --- Full-Stack Skills ---
  "write-full-stack-tests": {
    goal: "Write tests that cover both frontend behavior and backend API contracts end to end.",
    when: "a feature spans the frontend and backend and needs confident coverage across both layers.",
  },

  // --- Library Skills ---
  "design-public-api": {
    goal: "Design a minimal, stable public API surface that is easy to use and hard to misuse.",
    when: "defining the exports, types, and contract of a library module.",
  },
  "write-library-tests": {
    goal: "Write tests that protect the public API contract and the most critical internal logic.",
    when: "a library module needs confident automated coverage.",
  },
  "build-tree-shakeable-exports": {
    goal: "Structure module exports so consumers only pay for what they import.",
    when: "the library has multiple entry points or exports that should be individually tree-shakeable.",
  },
  "generate-typedoc": {
    goal: "Set up TypeDoc to generate accurate, navigable API documentation from JSDoc comments.",
    when: "the library needs generated API reference documentation.",
  },
  "configure-build": {
    goal: "Set up the bundler to produce clean, correctly typed build artifacts ready for publishing.",
    when: "the library build pipeline needs to be created or significantly improved.",
  },

  // --- CLI-Tool Skills ---
  "design-commands": {
    goal: "Design a CLI command surface that is intuitive, consistent, and self-documenting.",
    when: "defining or refactoring the CLI command structure and UX.",
  },
  "build-arg-parsing": {
    goal: "Implement argument parsing that handles flags, positional args, and validation cleanly.",
    when: "adding new commands or improving the reliability of existing argument handling.",
  },
  "implement-config-file": {
    goal: "Add support for a project-level config file that controls CLI behavior without flags.",
    when: "the CLI needs persistent or project-scoped configuration.",
  },
  "write-cli-tests": {
    goal: "Write tests that exercise CLI commands programmatically without spawning subprocesses.",
    when: "CLI commands need automated coverage.",
  },
  "configure-package-bin": {
    goal: "Set up package.json bin entries so the CLI is installable and runnable as expected.",
    when: "preparing the CLI for npm publishing or global installation.",
  },

  // --- Mobile Skills ---
  "build-screen-layout": {
    goal: "Create a screen layout with clear content regions, safe-area handling, and keyboard-aware behavior.",
    when: "a screen needs structured layout, safe area insets, and device-aware behavior.",
  },
  "build-navigation-stack": {
    goal: "Set up the navigation stack with typed routes, transitions, and deep-link support.",
    when: "the app needs screen-to-screen navigation with back behavior and deep links.",
  },
  "write-mobile-tests": {
    goal: "Write tests for mobile screens, components, and service integrations.",
    when: "mobile features need automated coverage.",
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

  // --- Web-App Agents ---
  "state-architect": {
    role: "Design and manage application state architecture including global, route, and component state.",
    focus: "State boundaries, data flow, caching strategy, and sync/async state transitions.",
  },
  "api-integrator": {
    role: "Connect frontend components to API endpoints with proper error handling and loading states.",
    focus: "Data fetching patterns, response typing, cache invalidation, and offline resilience.",
  },
  "auth-specialist": {
    role: "Implement and review authentication and authorization flows across the application.",
    focus: "Token management, session handling, route guards, and permission checks.",
  },
  "test-writer": {
    role: "Write and maintain automated tests that protect critical user flows and edge cases.",
    focus: "Test strategy, coverage of failure paths, and integration with CI pipelines.",
  },

  // --- API-Service Agents ---
  "api-designer": {
    role: "Design API resources, endpoints, and contracts that are consistent and easy to consume.",
    focus: "Resource naming, HTTP semantics, versioning, pagination, and error shapes.",
  },
  "data-layer-builder": {
    role: "Build and optimize the data access layer including queries, migrations, and connection pooling.",
    focus: "Query performance, schema design, type-safe data access, and migration safety.",
  },
  "error-handler": {
    role: "Design and implement error handling strategies across the service.",
    focus: "Error classification, structured logging, user-facing vs internal errors, and retry policies.",
  },
  "devops-reviewer": {
    role: "Review infrastructure, deployment config, and observability setups for production readiness.",
    focus: "Container config, health checks, logging, alerting, and environment management.",
  },

  // --- Library / CLI / Mobile Agents ---
  "docs-writer": {
    role: "Write and maintain technical documentation including API references, guides, and examples.",
    focus: "API docs, usage examples, changelog writing, and keeping docs in sync with code.",
  },
  "cli-designer": {
    role: "Design CLI command surfaces that are intuitive, consistent, and self-documenting.",
    focus: "Command names, flag naming conventions, help text quality, and error messaging.",
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
