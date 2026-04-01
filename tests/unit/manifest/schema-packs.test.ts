import { describe, it, expect } from "vitest";
import { manifestSchema } from "../../../src/manifest/schema.js";
import { webAppManifest } from "../../fixtures/manifests.js";

describe("manifest packs field", () => {
  it("validates manifest with packs: []", () => {
    const manifest = webAppManifest();
    const data = { ...manifest, packs: [] };
    const result = manifestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("validates manifest with a valid pack ref", () => {
    const manifest = webAppManifest();
    const data = {
      ...manifest,
      packs: [{ source: "builtin", id: "secure-defaults" }],
    };
    const result = manifestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("defaults packs to [] when not provided", () => {
    const manifest = webAppManifest();
    // Current manifest should already have packs: [] after schema addition
    expect(manifest.packs).toEqual([]);
  });

  it("rejects invalid pack ref (missing source)", () => {
    const manifest = webAppManifest();
    const data = {
      ...manifest,
      packs: [{ id: "test" }],
    };
    const result = manifestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid pack ref (invalid source)", () => {
    const manifest = webAppManifest();
    const data = {
      ...manifest,
      packs: [{ source: "remote", id: "test" }],
    };
    const result = manifestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
