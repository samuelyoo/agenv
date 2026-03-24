import type { Manifest } from "../../manifest/schema.js";
import type { GenerationPlan, PlannedFile } from "../../planner/build-plan.js";
import type { Adapter, RenderedFile, SupportResult } from "../types.js";

function supports(manifest: Manifest): SupportResult {
  return {
    supported: manifest.targets.cursor === true,
    issues:
      manifest.targets.cursor === true
        ? []
        : [
            {
              severity: "warning",
              code: "cursor_target_disabled",
              message: "Cursor output is disabled in the manifest targets.",
            },
          ],
  };
}

function plan(_manifest: Manifest, generationPlan: GenerationPlan): PlannedFile[] {
  return generationPlan.files.filter((file) => file.target === "cursor");
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

function renderProjectContext(manifest: Manifest): string {
  const lines = [
    `---`,
    `description: Project context for ${manifest.project.name}`,
    `alwaysApply: true`,
    `---`,
    ``,
    `# Project Context`,
    ``,
    `This is the **${manifest.project.name}** ${manifest.project.framework} ${describeProjectType(manifest)} written in TypeScript.`,
    ``,
    `## Key Facts`,
    ``,
    `- **Framework:** ${manifest.project.framework}`,
    `- **Project type:** ${describeProjectType(manifest)}`,
    `- **Language:** TypeScript (strict mode)`,
  ];

  if (manifest.conventions.accessibility) {
    lines.push(`- **Accessibility:** required — use semantic HTML and ARIA attributes`);
  }
  if (manifest.conventions.responsive) {
    lines.push(`- **Responsive:** required — support mobile, tablet, and desktop`);
  }
  if (manifest.conventions.authModel && manifest.conventions.authModel !== "none") {
    lines.push(`- **Auth model:** ${manifest.conventions.authModel}`);
  }

  return lines.join("\n") + "\n";
}

function renderCodingStyle(manifest: Manifest): string {
  const lines = [
    `---`,
    `description: Coding style rules for ${manifest.project.name}`,
    `alwaysApply: false`,
    `globs: src/**/*.{ts,tsx}`,
    `---`,
    ``,
    `# Coding Style`,
    ``,
    ...manifest.instructions.codingStyle.map((rule) => `- ${rule}`),
  ];

  return lines.join("\n") + "\n";
}

function renderFramework(manifest: Manifest): string {
  const fw = manifest.project.framework;
  const frameworkGuidance: string[] = [];

  switch (fw) {
    case "nextjs":
      frameworkGuidance.push(
        "Use the App Router with server components by default. Only add `\"use client\"` when the component needs interactivity.",
        "Keep data fetching in server components or route handlers.",
        "Use `next/image` for optimized images and `next/link` for internal navigation.",
      );
      break;
    case "vite-react":
      frameworkGuidance.push(
        "Use Vite conventions. Lazy-import route-level components for code splitting.",
        "Keep CSS modules or Tailwind utility classes co-located with components.",
      );
      break;
    case "react":
      frameworkGuidance.push(
        "Prefer composition over inheritance. Lift state only when sibling components need it.",
      );
      break;
    case "express":
    case "fastify":
    case "hono":
      frameworkGuidance.push(
        `Use ${fw} idioms for handlers and middleware.`,
        "Keep controllers thin — delegate business logic to service functions.",
        "Validate all inputs at the handler boundary before passing data to services.",
      );
      break;
  }

  const globs =
    fw === "express" || fw === "fastify" || fw === "hono"
      ? "src/**/*.ts"
      : "src/**/*.{ts,tsx}";

  const lines = [
    `---`,
    `description: ${fw} framework conventions`,
    `alwaysApply: false`,
    `globs: ${globs}`,
    `---`,
    ``,
    `# ${fw.charAt(0).toUpperCase()}${fw.slice(1)} Conventions`,
    ``,
    ...frameworkGuidance.map((g) => `- ${g}`),
  ];

  return lines.join("\n") + "\n";
}

function renderCodeReview(manifest: Manifest): string {
  const lines = [
    `---`,
    `description: Code review rules for ${manifest.project.name}`,
    `alwaysApply: false`,
    `---`,
    ``,
    `# Code Review Rules`,
    ``,
    ...manifest.instructions.reviewRules.map((rule) => `- ${rule}`),
  ];

  return lines.join("\n") + "\n";
}

function renderRule(file: PlannedFile, manifest: Manifest): string {
  const ruleName = file.path.split("/").pop()?.replace(".mdc", "") ?? "rule";
  switch (ruleName) {
    case "context":
      return renderProjectContext(manifest);
    case "coding-style":
      return renderCodingStyle(manifest);
    case "framework":
      return renderFramework(manifest);
    case "code-review":
      return renderCodeReview(manifest);
    default:
      return `# ${ruleName}\n\nGenerated by agenv for ${manifest.project.name}.\n`;
  }
}

function render(file: PlannedFile, manifest: Manifest): RenderedFile {
  return {
    path: file.path,
    trustSensitive: file.trustSensitive,
    content: renderRule(file, manifest),
  };
}

export const cursorAdapter: Adapter = {
  id: "cursor",
  supports,
  plan,
  render,
};
