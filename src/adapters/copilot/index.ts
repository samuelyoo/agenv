import type { Manifest } from "../../manifest/schema.js";
import type { GenerationPlan, PlannedFile } from "../../planner/build-plan.js";
import type { Adapter, RenderedFile, SupportResult } from "../types.js";
import {
  buildFrameworkGuidance,
  buildLanguageGuidance,
  describeLanguage,
  describeProjectType,
} from "../project-context.js";

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

function render(file: PlannedFile, manifest: Manifest): RenderedFile {
  const frameworkGuidance = [
    ...buildLanguageGuidance(manifest),
    ...buildFrameworkGuidance(manifest),
  ];
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
    `This is the ${manifest.project.name} ${manifest.project.framework} ${describeProjectType(manifest)} written in ${describeLanguage(manifest)}.`,
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
