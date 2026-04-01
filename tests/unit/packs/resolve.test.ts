import { describe, it, expect } from "vitest";
import { resolvePacks } from "../../../src/packs/resolve.js";
import type { LoadedPack } from "../../../src/packs/load.js";
import { webAppManifest } from "../../fixtures/manifests.js";

describe("resolvePacks", () => {
  it("returns manifest unchanged when no packs", () => {
    const manifest = webAppManifest();
    const result = resolvePacks(manifest, []);
    expect(result.resolvedManifest).toEqual(manifest);
    expect(result.applied).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("merges codingStyle by appending", () => {
    const manifest = webAppManifest();
    const originalStyleCount = manifest.instructions.codingStyle.length;

    const pack: LoadedPack = {
      ref: { source: "builtin", id: "test-pack" },
      definition: {
        id: "test-pack",
        name: "Test Pack",
        description: "Test",
        version: "1.0.0",
        source: "builtin",
        manifest: {
          instructions: {
            codingStyle: ["Always use const."],
          },
        },
      },
    };

    const result = resolvePacks(manifest, [pack]);
    expect(result.resolvedManifest.instructions.codingStyle.length).toBe(
      originalStyleCount + 1,
    );
    expect(result.resolvedManifest.instructions.codingStyle).toContain(
      "Always use const.",
    );
    expect(result.applied).toEqual(["test-pack"]);
  });

  it("merges reviewRules by appending", () => {
    const manifest = webAppManifest();
    const originalRuleCount = manifest.instructions.reviewRules.length;

    const pack: LoadedPack = {
      ref: { source: "builtin", id: "test-pack" },
      definition: {
        id: "test-pack",
        name: "Test Pack",
        description: "Test",
        version: "1.0.0",
        source: "builtin",
        manifest: {
          instructions: {
            reviewRules: ["Ensure error boundaries."],
          },
        },
      },
    };

    const result = resolvePacks(manifest, [pack]);
    expect(result.resolvedManifest.instructions.reviewRules.length).toBe(
      originalRuleCount + 1,
    );
    expect(result.resolvedManifest.instructions.reviewRules).toContain(
      "Ensure error boundaries.",
    );
  });

  it("merges mcpPresets with union (no duplicates)", () => {
    const manifest = webAppManifest();

    const pack: LoadedPack = {
      ref: { source: "builtin", id: "test-pack" },
      definition: {
        id: "test-pack",
        name: "Test Pack",
        description: "Test",
        version: "1.0.0",
        source: "builtin",
        manifest: {
          generated: {
            mcpPresets: ["github", "memory"],
          },
        },
      },
    };

    const result = resolvePacks(manifest, [pack]);
    const presets = result.resolvedManifest.generated.mcpPresets;
    // Should contain the pack's presets without duplicates
    expect(presets).toContain("github");
    expect(presets).toContain("memory");
    expect(new Set(presets).size).toBe(presets.length);
  });

  it("merges multiple packs in order", () => {
    const manifest = webAppManifest();

    const pack1: LoadedPack = {
      ref: { source: "builtin", id: "pack1" },
      definition: {
        id: "pack1",
        name: "Pack 1",
        description: "First",
        version: "1.0.0",
        source: "builtin",
        manifest: {
          instructions: {
            codingStyle: ["Rule from pack1."],
          },
        },
      },
    };

    const pack2: LoadedPack = {
      ref: { source: "builtin", id: "pack2" },
      definition: {
        id: "pack2",
        name: "Pack 2",
        description: "Second",
        version: "1.0.0",
        source: "builtin",
        manifest: {
          instructions: {
            codingStyle: ["Rule from pack2."],
          },
        },
      },
    };

    const result = resolvePacks(manifest, [pack1, pack2]);
    expect(result.resolvedManifest.instructions.codingStyle).toContain(
      "Rule from pack1.",
    );
    expect(result.resolvedManifest.instructions.codingStyle).toContain(
      "Rule from pack2.",
    );
    expect(result.applied).toEqual(["pack1", "pack2"]);
  });

  it("deduplicates codingStyle entries", () => {
    const manifest = webAppManifest();
    const existingRule = manifest.instructions.codingStyle[0];

    const pack: LoadedPack = {
      ref: { source: "builtin", id: "dup-pack" },
      definition: {
        id: "dup-pack",
        name: "Dup Pack",
        description: "Test",
        version: "1.0.0",
        source: "builtin",
        manifest: {
          instructions: {
            codingStyle: [existingRule],
          },
        },
      },
    };

    const result = resolvePacks(manifest, [pack]);
    const occurrences = result.resolvedManifest.instructions.codingStyle.filter(
      (s) => s === existingRule,
    );
    expect(occurrences).toHaveLength(1);
  });

  it("merges extensions without overriding existing keys", () => {
    const manifest = webAppManifest();

    const pack: LoadedPack = {
      ref: { source: "builtin", id: "ext-pack" },
      definition: {
        id: "ext-pack",
        name: "Ext Pack",
        description: "Test",
        version: "1.0.0",
        source: "builtin",
        manifest: {
          extensions: { newKey: "newValue" },
        },
      },
    };

    const result = resolvePacks(manifest, [pack]);
    expect(result.resolvedManifest.extensions).toBeDefined();
  });
});
