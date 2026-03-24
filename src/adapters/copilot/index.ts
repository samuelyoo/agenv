import type { Manifest } from "../../manifest/schema.js";
import type { GenerationPlan, PlannedFile } from "../../planner/build-plan.js";
import type { Adapter, RenderedFile, SupportResult } from "../types.js";

function supports(manifest: Manifest): SupportResult {
  return {
    supported: manifest.targets.copilot,
    issues: manifest.targets.copilot
      ? []
      : [
          {
            severity: "warning",
            code: "copilot_target_disabled",
            message: "Copilot output is disabled in the manifest targets.",
          },
        ],
  };
}

function plan(_manifest: Manifest, generationPlan: GenerationPlan): PlannedFile[] {
  return generationPlan.files.filter((file) => file.target === "copilot");
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

function buildFrameworkGuidance(manifest: Manifest): string[] {
  const lines: string[] = [];

  switch (manifest.project.framework) {
    case "nextjs":
      lines.push(
        "Use the App Router with server components by default. Only add `\"use client\"` when the component needs interactivity.",
        "Keep data fetching in server components or route handlers.",
        "Use `next/image` for optimized images and `next/link` for internal navigation.",
      );
      break;
    case "vite-react":
      lines.push(
        "Use Vite conventions. Lazy-import route-level components for code splitting.",
        "Keep CSS modules or Tailwind utility classes co-located with components.",
      );
      break;
    case "react":
      lines.push(
        "Prefer composition over inheritance. Lift state only when sibling components need it.",
      );
      break;
    case "express":
    case "fastify":
    case "hono":
      lines.push(
        `Use ${manifest.project.framework} idioms for handlers and middleware.`,
        "Keep controllers thin — delegate business logic to service functions.",
        "Validate all inputs at the handler boundary before passing data to services.",
      );
      break;
  }

  return lines;
}

function render(file: PlannedFile, manifest: Manifest): RenderedFile {
  const frameworkGuidance = buildFrameworkGuidance(manifest);
  const conventionLines: string[] = [];

  if (manifest.conventions.accessibility) {
    conventionLines.push("All interactive elements must be keyboard-accessible with visible focus indicators.");
  }
  if (manifest.conventions.responsive) {
    conventionLines.push("All layouts must be responsive across mobile, tablet, and desktop.");
  }
  if (manifest.conventions.authModel && manifest.conventions.authModel !== "none") {
    conventionLines.push(`Auth model: ${manifest.conventions.authModel}. Check authorization before rendering or executing protected operations.`);
  }

  const sections = [
    `# Copilot Instructions`,
    ``,
    `## Project`,
    ``,
    `This is the ${manifest.project.name} ${manifest.project.framework} ${describeProjectType(manifest)}.`,
    ``,
    ...(frameworkGuidance.length > 0
      ? [`## Framework`, ``, ...frameworkGuidance.map((l) => `- ${l}`), ``]
      : []),
    `## Coding Style`,
    ``,
    ...manifest.instructions.codingStyle.map((rule) => `- ${rule}`),
    ``,
    `## Review Rules`,
    ``,
    ...manifest.instructions.reviewRules.map((rule) => `- ${rule}`),
    ``,
    ...(conventionLines.length > 0
      ? [`## Conventions`, ``, ...conventionLines.map((l) => `- ${l}`), ``]
      : []),
  ];

  return {
    path: file.path,
    trustSensitive: file.trustSensitive,
    content: `${sections.join("\n")}\n`,
  };
}

export const copilotAdapter: Adapter = {
  id: "copilot",
  supports,
  plan,
  render,
};
