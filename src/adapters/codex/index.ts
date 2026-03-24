import type { Manifest } from "../../manifest/schema.js";
import type { GenerationPlan, PlannedFile } from "../../planner/build-plan.js";
import type { Adapter, RenderedFile, SupportResult } from "../types.js";

function supports(manifest: Manifest): SupportResult {
  return {
    supported: manifest.targets.codex,
    issues: manifest.targets.codex
      ? []
      : [
          {
            severity: "warning",
            code: "codex_target_disabled",
            message: "Codex output is disabled in the manifest targets.",
          },
        ],
  };
}

function plan(_manifest: Manifest, generationPlan: GenerationPlan): PlannedFile[] {
  return generationPlan.files.filter((file) => file.target === "codex");
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

function buildFrameworkSection(manifest: Manifest): string {
  const lines: string[] = [`This is a ${manifest.project.framework} ${describeProjectType(manifest)} written in TypeScript.`];

  switch (manifest.project.framework) {
    case "nextjs":
      lines.push(
        "Use the App Router and server components by default. Only add `\"use client\"` when the component needs interactivity or browser APIs.",
        "Keep data fetching in server components or route handlers. Avoid mixing client-side and server-side data loading in the same component.",
        "Use `next/image` for images and `next/link` for internal navigation.",
      );
      break;
    case "vite-react":
      lines.push(
        "The project uses Vite with React. Leverage fast HMR during development.",
        "Keep route definitions centralized. Use lazy imports for route-level code splitting.",
      );
      break;
    case "react":
      lines.push(
        "Follow standard React patterns: lift state only when siblings need it, prefer composition over inheritance, and keep components focused.",
      );
      break;
    case "express":
    case "fastify":
    case "hono":
      lines.push(
        `Use ${manifest.project.framework} middleware and route handlers. Keep controllers thin — delegate business logic to service functions.`,
        "Validate all request inputs at the handler boundary before passing to services.",
      );
      break;
  }

  return lines.join("\n");
}

function buildConventionsSection(manifest: Manifest): string {
  const rules: string[] = [];

  if (manifest.conventions.accessibility) {
    rules.push("All interactive elements must be keyboard-accessible with visible focus indicators. Use semantic HTML and ARIA attributes.");
  }
  if (manifest.conventions.responsive) {
    rules.push("All layouts must be responsive. Test at mobile (375px), tablet (768px), and desktop (1280px) breakpoints.");
  }
  if (manifest.conventions.authModel && manifest.conventions.authModel !== "none") {
    rules.push(`Auth model is ${manifest.conventions.authModel}. Always check authorization before rendering protected content or executing protected operations.`);
  }
  if (manifest.conventions.folderStructure) {
    rules.push(`Folder structure: ${manifest.conventions.folderStructure}`);
  }

  if (manifest.project.type === "dashboard" && manifest.dashboard) {
    rules.push(
      `Styling: ${manifest.dashboard.styling}. Components: ${manifest.dashboard.components}.`,
      `Data fetching: ${manifest.dashboard.dataFetching}. Tables: ${manifest.dashboard.tables}. Charts: ${manifest.dashboard.charts}.`,
      `Forms: ${manifest.dashboard.forms}. State management: ${manifest.dashboard.state}.`,
      `Testing stack: ${manifest.dashboard.testing.join(", ")}.`,
    );
  }

  if (manifest.project.type === "api-service" && manifest.apiService) {
    rules.push(
      `API style: ${manifest.apiService.apiStyle}. Validation: ${manifest.apiService.validation}. ORM: ${manifest.apiService.orm}.`,
      `Auth: ${manifest.apiService.auth}. Testing stack: ${manifest.apiService.testing.join(", ")}.`,
    );
  }

  if (manifest.project.type === "web-app" && manifest.webApp) {
    rules.push(
      `Styling: ${manifest.webApp.styling}. Components: ${manifest.webApp.components}.`,
      `State management: ${manifest.webApp.stateManagement}. Data fetching: ${manifest.webApp.dataFetching}.`,
      `Forms: ${manifest.webApp.forms}. Auth: ${manifest.webApp.auth}.`,
      `Testing stack: ${manifest.webApp.testing.join(", ")}.`,
    );
  }

  if (manifest.project.type === "full-stack" && manifest.fullStack) {
    rules.push(
      `API style: ${manifest.fullStack.apiStyle}. ORM: ${manifest.fullStack.orm}. Auth: ${manifest.fullStack.auth}.`,
      `Styling: ${manifest.fullStack.styling}. Components: ${manifest.fullStack.components}.`,
      `Testing stack: ${manifest.fullStack.testing.join(", ")}.`,
    );
  }

  if (manifest.project.type === "library" && manifest.library) {
    rules.push(
      `Bundler: ${manifest.library.bundler}. Publish target: ${manifest.library.publishTarget}.`,
      `Docs tool: ${manifest.library.docs}. Testing stack: ${manifest.library.testing.join(", ")}.`,
    );
  }

  if (manifest.project.type === "cli-tool" && manifest.cliTool) {
    rules.push(
      `Runtime: ${manifest.cliTool.runtime}. Arg parser: ${manifest.cliTool.argParser}.`,
      `Publish target: ${manifest.cliTool.publishTarget}. Testing stack: ${manifest.cliTool.testing.join(", ")}.`,
    );
  }

  if (manifest.project.type === "mobile" && manifest.mobile) {
    rules.push(
      `Framework: ${manifest.mobile.framework}. Styling: ${manifest.mobile.styling}.`,
      `Navigation: ${manifest.mobile.navigation}. Testing stack: ${manifest.mobile.testing.join(", ")}.`,
    );
  }

  return rules.length > 0 ? rules.map((r) => `- ${r}`).join("\n") : "- Follow standard project conventions.";
}

function render(file: PlannedFile, manifest: Manifest): RenderedFile {
  const sections = [
    `# AGENTS`,
    ``,
    `## Project Overview`,
    ``,
    buildFrameworkSection(manifest),
    ``,
    `## Conventions`,
    ``,
    buildConventionsSection(manifest),
    ``,
    `## Coding Style`,
    ``,
    ...manifest.instructions.codingStyle.map((rule) => `- ${rule}`),
    ``,
    `## Review Rules`,
    ``,
    ...manifest.instructions.reviewRules.map((rule) => `- ${rule}`),
    ``,
  ];

  return {
    path: file.path,
    trustSensitive: file.trustSensitive,
    content: `${sections.join("\n")}\n`,
  };
}

export const codexAdapter: Adapter = {
  id: "codex",
  supports,
  plan,
  render,
};
