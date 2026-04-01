import { describe, expect, it } from "vitest";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import {
  checkDangerousPatterns,
  checkLockfileFreshness,
  checkMcpTrustLevels,
  checkMissingEnvVars,
} from "../../../src/audit/rules.js";
import type { Lockfile } from "../../../src/install/lockfile.js";
import { computeManifestHash } from "../../../src/install/lockfile.js";

function makeManifestWithPresets(presetIds: string[]) {
  const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
  manifest.targets.mcp = true;
  manifest.generated.mcpPresets = presetIds;
  return manifest;
}

describe("checkMcpTrustLevels", () => {
  it("flags dangerous presets as warnings", () => {
    const manifest = makeManifestWithPresets(["filesystem"]);
    const findings = checkMcpTrustLevels(manifest);
    expect(findings.some((f) => f.code === "mcp_trust_dangerous")).toBe(true);
    expect(findings.find((f) => f.code === "mcp_trust_dangerous")?.severity).toBe("warning");
  });

  it("flags review presets as info", () => {
    const manifest = makeManifestWithPresets(["github"]);
    const findings = checkMcpTrustLevels(manifest);
    expect(findings.some((f) => f.code === "mcp_trust_review")).toBe(true);
    expect(findings.find((f) => f.code === "mcp_trust_review")?.severity).toBe("info");
  });

  it("returns empty for safe-only presets", () => {
    const manifest = makeManifestWithPresets(["memory"]);
    const findings = checkMcpTrustLevels(manifest);
    expect(findings).toHaveLength(0);
  });
});

describe("checkMissingEnvVars", () => {
  it("flags presets with env placeholders", () => {
    const manifest = makeManifestWithPresets(["github"]);
    const findings = checkMissingEnvVars(manifest);
    expect(findings.some((f) => f.code === "mcp_env_placeholder")).toBe(true);
  });

  it("returns empty when preset has no env vars", () => {
    const manifest = makeManifestWithPresets(["memory"]);
    const findings = checkMissingEnvVars(manifest);
    expect(findings).toHaveLength(0);
  });
});

describe("checkDangerousPatterns", () => {
  it("flags filesystem preset", () => {
    const manifest = makeManifestWithPresets(["filesystem"]);
    const findings = checkDangerousPatterns(manifest);
    expect(findings.some((f) => f.code === "mcp_dangerous_pattern")).toBe(true);
  });

  it("flags puppeteer preset", () => {
    const manifest = makeManifestWithPresets(["puppeteer"]);
    const findings = checkDangerousPatterns(manifest);
    expect(findings.some((f) => f.code === "mcp_dangerous_pattern")).toBe(true);
  });

  it("returns empty for safe presets", () => {
    const manifest = makeManifestWithPresets(["memory"]);
    const findings = checkDangerousPatterns(manifest);
    expect(findings).toHaveLength(0);
  });
});

describe("checkLockfileFreshness", () => {
  it("flags missing lockfile when packs exist", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.packs = [{ source: "builtin", id: "secure-defaults" }];
    const findings = checkLockfileFreshness(manifest, undefined);
    expect(findings.some((f) => f.code === "lockfile_missing")).toBe(true);
  });

  it("flags stale lockfile", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.packs = [{ source: "builtin", id: "secure-defaults" }];
    const lockfile: Lockfile = {
      schemaVersion: "1",
      generatedAt: new Date().toISOString(),
      manifestHash: "stale-hash",
      packs: [],
    };
    const findings = checkLockfileFreshness(manifest, lockfile);
    expect(findings.some((f) => f.code === "lockfile_stale")).toBe(true);
  });

  it("returns empty for fresh lockfile", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    manifest.packs = [{ source: "builtin", id: "secure-defaults" }];
    const lockfile: Lockfile = {
      schemaVersion: "1",
      generatedAt: new Date().toISOString(),
      manifestHash: computeManifestHash(manifest),
      packs: [],
    };
    const findings = checkLockfileFreshness(manifest, lockfile);
    expect(findings).toHaveLength(0);
  });

  it("returns empty when no packs configured", () => {
    const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType: "web-app" });
    const findings = checkLockfileFreshness(manifest, undefined);
    expect(findings).toHaveLength(0);
  });
});
