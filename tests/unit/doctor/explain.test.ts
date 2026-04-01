import { describe, expect, it } from "vitest";
import { getAllExplanations, getExplanation } from "../../../src/doctor/explain.js";

describe("getExplanation", () => {
  it("returns explanation for known code", () => {
    const explanation = getExplanation("mcp_review_required");
    expect(explanation).toBeDefined();
    expect(explanation?.title).toBeTruthy();
    expect(explanation?.description).toBeTruthy();
    expect(explanation?.remediation).toBeTruthy();
  });

  it("returns undefined for unknown code", () => {
    expect(getExplanation("nonexistent_code")).toBeUndefined();
  });

  it("all explanations have required fields", () => {
    const all = getAllExplanations();
    for (const exp of all) {
      expect(exp.code).toBeTruthy();
      expect(exp.title).toBeTruthy();
      expect(exp.description).toBeTruthy();
      expect(exp.remediation).toBeTruthy();
    }
  });

  it("covers existing doctor codes and new audit codes", () => {
    const expectedCodes = [
      "manifest_missing",
      "framework_mismatch",
      "mcp_review_required",
      "local_override_missing",
      "mcp_trust_dangerous",
      "mcp_trust_review",
      "mcp_dangerous_pattern",
      "lockfile_missing",
      "lockfile_stale",
      "ownership_modified",
      "ownership_missing",
    ];

    for (const code of expectedCodes) {
      expect(getExplanation(code)).toBeDefined();
    }
  });
});
