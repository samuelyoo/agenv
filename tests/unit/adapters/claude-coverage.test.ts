import { describe, expect, it } from "vitest";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";
import { getSkillsForType, getAgentsForType } from "../../../src/planner/output-map.js";
import { renderPlanFiles } from "../../../src/render/render-plan.js";
import { projectTypeSchema, type Framework, type ProjectType } from "../../../src/manifest/schema.js";

const PROJECT_TYPES = projectTypeSchema.options;

function frameworkFor(projectType: ProjectType): Framework {
  const backendTypes: ProjectType[] = ["api-service", "cli-tool"];
  return backendTypes.includes(projectType) ? "express" : "react";
}

describe("Claude skill/agent description coverage", () => {
  for (const projectType of PROJECT_TYPES) {
    describe(projectType, () => {
      it("renders all skills without fallback text", () => {
        const manifest = buildRecommendedManifest({
          name: "coverage-test",
          framework: frameworkFor(projectType),
          projectType,
          targets: { copilot: true, claude: true, codex: true, mcp: false },
          generated: { skills: true, agents: false, prompts: "master", mcpPresets: [] },
        });

        const plan = buildGenerationPlan(manifest);
        const rendered = renderPlanFiles(manifest, plan);
        const skillFiles = rendered.filter((f) => f.path.includes("/skills/"));

        const expectedSkills = getSkillsForType(projectType);
        expect(skillFiles.length).toBe(expectedSkills.length);

        for (const file of skillFiles) {
          expect(file.content.length).toBeGreaterThan(50);
          expect(file.content).toContain("## Goal");
          expect(file.content).toContain("## When to Use");
          expect(file.content).toContain("## Project Context");
        }
      });

      it("renders all agents without fallback text", () => {
        const manifest = buildRecommendedManifest({
          name: "coverage-test",
          framework: frameworkFor(projectType),
          projectType,
          targets: { copilot: true, claude: true, codex: true, mcp: false },
          generated: { skills: false, agents: true, prompts: "master", mcpPresets: [] },
        });

        const plan = buildGenerationPlan(manifest);
        const rendered = renderPlanFiles(manifest, plan);
        const agentFiles = rendered.filter((f) => f.path.includes("/agents/"));

        const expectedAgents = getAgentsForType(projectType);
        expect(agentFiles.length).toBe(expectedAgents.length);

        for (const file of agentFiles) {
          expect(file.content.length).toBeGreaterThan(50);
          expect(file.content).toContain("## Role");
          expect(file.content).toContain("## Focus");
          expect(file.content).toContain("## Project Context");
        }
      });
    });
  }
});
