import { describe, it, expect } from "vitest";
import {
  manifestPackRefSchema,
  packManifestFragmentSchema,
} from "../../../src/packs/schema.js";

describe("manifestPackRefSchema", () => {
  it("accepts a valid builtin pack ref", () => {
    const result = manifestPackRefSchema.safeParse({
      source: "builtin",
      id: "secure-defaults",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid local pack ref with path", () => {
    const result = manifestPackRefSchema.safeParse({
      source: "local",
      id: "my-pack",
      path: "./packs/my-pack",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a ref with version", () => {
    const result = manifestPackRefSchema.safeParse({
      source: "builtin",
      id: "secure-defaults",
      version: "1.0.0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a ref with missing id", () => {
    const result = manifestPackRefSchema.safeParse({
      source: "builtin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a ref with invalid source", () => {
    const result = manifestPackRefSchema.safeParse({
      source: "remote",
      id: "test",
    });
    expect(result.success).toBe(false);
  });
});

describe("packManifestFragmentSchema", () => {
  it("accepts a valid fragment with instructions", () => {
    const result = packManifestFragmentSchema.safeParse({
      instructions: {
        codingStyle: ["Use strict mode."],
        reviewRules: ["Check error handling."],
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty fragment", () => {
    const result = packManifestFragmentSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a fragment with generated mcpPresets", () => {
    const result = packManifestFragmentSchema.safeParse({
      generated: {
        mcpPresets: ["github"],
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a fragment with conventions", () => {
    const result = packManifestFragmentSchema.safeParse({
      conventions: {
        accessibility: true,
        responsive: true,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a fragment with extensions", () => {
    const result = packManifestFragmentSchema.safeParse({
      extensions: { custom: "value" },
    });
    expect(result.success).toBe(true);
  });
});
