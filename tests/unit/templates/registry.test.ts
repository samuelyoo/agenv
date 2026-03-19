import { describe, expect, it } from "vitest";
import { TEMPLATE_REGISTRY } from "../../../src/templates/registry.js";

describe("TEMPLATE_REGISTRY", () => {
  it("includes dashboard, web-app, and api-service starter templates", () => {
    const projectTypes = new Set(TEMPLATE_REGISTRY.map((template) => template.projectType));

    expect(projectTypes.has("dashboard")).toBe(true);
    expect(projectTypes.has("web-app")).toBe(true);
    expect(projectTypes.has("api-service")).toBe(true);
  });
});
