import { describe, expect, it } from "vitest";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { renderSharedFile } from "../../../src/render/shared.js";
import type { PlannedFile } from "../../../src/planner/build-plan.js";

function makePromptFile(path: string): PlannedFile {
  return {
    target: "shared",
    path,
    layer: "prompts",
    scope: "shared",
    purpose: "test prompt file",
    generated: true,
    trustSensitive: false,
    status: "planned",
  };
}

describe("renderSharedFile prompt rendering", () => {
  it("renders a structured specialized prompt for web-app work", () => {
    const manifest = buildRecommendedManifest({
      name: "marketing-site",
      framework: "nextjs",
      projectType: "web-app",
      generated: {
        prompts: "pack",
      },
    });

    const rendered = renderSharedFile(makePromptFile("docs/ai-prompts/build-page-shell.md"), manifest);

    expect(rendered.content).toContain("# Build Page Shell");
    expect(rendered.content).toContain("web app");
    expect(rendered.content).toContain("Ready-To-Use Prompt");
    expect(rendered.content).not.toContain("Prompt scaffold");
  });

  it("lists specialized prompt files in pack mode", () => {
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "react",
      generated: {
        prompts: "pack",
      },
    });

    const rendered = renderSharedFile(makePromptFile("docs/ai-prompts/README.md"), manifest);

    expect(rendered.content).toContain("build-page-shell.md");
    expect(rendered.content).toContain("qa-reviewer.md");
    expect(rendered.content).toContain("Pack mode adds specialized prompts");
  });
});
