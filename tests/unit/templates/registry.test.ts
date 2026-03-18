import { describe, expect, it } from "vitest";
import { TEMPLATE_REGISTRY } from "../../../src/templates/registry.js";

describe("TEMPLATE_REGISTRY", () => {
  it("includes both dashboard and web-app starter templates", () => {
    const projectTypes = new Set(TEMPLATE_REGISTRY.map((template) => template.projectType));

    expect(projectTypes.has("dashboard")).toBe(true);
    expect(projectTypes.has("web-app")).toBe(true);
  });
});
