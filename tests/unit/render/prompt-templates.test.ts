import { describe, expect, it } from "vitest";
import { PROMPT_TEMPLATE_DEFINITIONS } from "../../../src/render/prompt-templates.js";
import type { PromptTemplateDefinition } from "../../../src/render/prompt-templates.js";

describe("PROMPT_TEMPLATE_DEFINITIONS", () => {
  it("contains all 57 expected templates", () => {
    const keys = Object.keys(PROMPT_TEMPLATE_DEFINITIONS);
    expect(keys).toHaveLength(57);

    expect(keys).toEqual(
      expect.arrayContaining([
        // Dashboard skills & agents (original 16)
        "build-page-shell",
        "build-data-table",
        "build-filter-panel",
        "build-kpi-cards",
        "build-chart-section",
        "connect-api-resource",
        "build-form-flow",
        "handle-loading-empty-error-states",
        "enforce-accessibility-and-responsive-layout",
        "write-dashboard-tests",
        "ui-builder",
        "data-integrator",
        "table-specialist",
        "chart-specialist",
        "form-builder",
        "qa-reviewer",
        // Web-app skills
        "build-page-layout",
        "build-navigation",
        "build-auth-flow",
        "build-state-management",
        "build-api-integration",
        "implement-routing",
        "write-web-app-tests",
        // Web-app agents
        "state-architect",
        "api-integrator",
        "auth-specialist",
        "test-writer",
        // API-service skills
        "design-api-endpoints",
        "build-request-validation",
        "build-database-layer",
        "build-auth-middleware",
        "build-error-handling",
        "implement-logging",
        "write-api-tests",
        "build-background-jobs",
        "configure-deployment",
        "document-api",
        // API-service agents
        "api-designer",
        "data-layer-builder",
        "error-handler",
        "devops-reviewer",
        // Full-stack skills
        "write-full-stack-tests",
        // Library skills & agents
        "design-public-api",
        "write-library-tests",
        "build-tree-shakeable-exports",
        "generate-typedoc",
        "configure-build",
        "docs-writer",
        // CLI-tool skills & agents
        "design-commands",
        "build-arg-parsing",
        "implement-config-file",
        "write-cli-tests",
        "configure-package-bin",
        "cli-designer",
        // Mobile skills
        "build-screen-layout",
        "build-navigation-stack",
        "write-mobile-tests",
      ]),
    );
  });

  it("each template has the required shape", () => {
    for (const [key, def] of Object.entries(PROMPT_TEMPLATE_DEFINITIONS)) {
      const template = def as PromptTemplateDefinition;

      expect(typeof template.title, `${key}.title`).toBe("string");
      expect(template.title.length, `${key}.title length`).toBeGreaterThan(0);

      expect(typeof template.goal, `${key}.goal`).toBe("string");
      expect(template.goal.length, `${key}.goal length`).toBeGreaterThan(0);

      expect(typeof template.useWhen, `${key}.useWhen`).toBe("string");

      expect(Array.isArray(template.focusAreas), `${key}.focusAreas`).toBe(true);
      expect(template.focusAreas.length, `${key}.focusAreas length`).toBeGreaterThan(0);

      expect(Array.isArray(template.deliverables), `${key}.deliverables`).toBe(true);
      expect(template.deliverables.length, `${key}.deliverables length`).toBeGreaterThan(0);
    }
  });
});
