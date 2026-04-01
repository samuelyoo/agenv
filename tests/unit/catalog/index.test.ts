import { describe, expect, it } from "vitest";
import { listCatalog, getCatalogEntry, searchCatalog, type CatalogEntry } from "../../../src/catalog/index.js";

describe("listCatalog", () => {
  it("returns all entries with compatibility and provenance fields", () => {
    const entries = listCatalog();
    expect(entries.length).toBeGreaterThanOrEqual(3);
    for (const entry of entries) {
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("version");
      expect(entry).toHaveProperty("description");
      expect(entry).toHaveProperty("compatibility");
      expect(entry).toHaveProperty("provenance");
      expect(entry).toHaveProperty("definition");
      expect(entry.provenance).toHaveProperty("source");
      expect(entry.provenance).toHaveProperty("publisher");
    }
  });
});

describe("getCatalogEntry", () => {
  it("returns entry by ID", () => {
    const entry = getCatalogEntry("secure-defaults");
    expect(entry).toBeDefined();
    expect(entry!.id).toBe("secure-defaults");
    expect(entry!.definition.name).toBe("Secure Defaults");
  });

  it("returns undefined for unknown ID", () => {
    const entry = getCatalogEntry("nonexistent-pack");
    expect(entry).toBeUndefined();
  });
});

describe("searchCatalog", () => {
  it("matches by name substring", () => {
    const results = searchCatalog("Secure");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((e) => e.id === "secure-defaults")).toBe(true);
  });

  it("matches by description substring", () => {
    const results = searchCatalog("testing best-practice");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((e) => e.id === "testing-essentials")).toBe(true);
  });

  it("returns empty for no match", () => {
    const results = searchCatalog("zzz-nonexistent-query-zzz");
    expect(results).toEqual([]);
  });
});
