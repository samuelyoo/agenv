import { describe, it, expect } from "vitest";
import {
  BUILTIN_PACKS,
  getPackById,
  listPacks,
  VALID_PACK_IDS,
} from "../../../src/packs/catalog.js";

describe("BUILTIN_PACKS", () => {
  it("has at least 3 entries", () => {
    expect(BUILTIN_PACKS.length).toBeGreaterThanOrEqual(3);
  });

  it("each pack has required fields", () => {
    for (const pack of BUILTIN_PACKS) {
      expect(pack.id).toBeTruthy();
      expect(pack.name).toBeTruthy();
      expect(pack.description).toBeTruthy();
      expect(pack.version).toBeTruthy();
      expect(pack.source).toBe("builtin");
      expect(pack.manifest).toBeDefined();
    }
  });
});

describe("getPackById", () => {
  it("returns a pack for a known id", () => {
    const pack = getPackById("secure-defaults");
    expect(pack).toBeDefined();
    expect(pack!.id).toBe("secure-defaults");
  });

  it("returns undefined for an unknown id", () => {
    const pack = getPackById("nonexistent-pack");
    expect(pack).toBeUndefined();
  });
});

describe("listPacks", () => {
  it("returns all packs", () => {
    const packs = listPacks();
    expect(packs).toHaveLength(BUILTIN_PACKS.length);
    expect(packs).toEqual(BUILTIN_PACKS);
  });
});

describe("VALID_PACK_IDS", () => {
  it("contains all pack ids", () => {
    const ids = BUILTIN_PACKS.map((p) => p.id);
    expect(VALID_PACK_IDS).toEqual(ids);
  });
});
