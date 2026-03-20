import { describe, expect, it } from "vitest";
import { migrateManifest, CURRENT_SCHEMA_VERSION } from "../../../src/manifest/migrate.js";

describe("migrateManifest", () => {
  it("adds schemaVersion when missing", () => {
    const result = migrateManifest({ project: { name: "test" } });

    expect(result["schemaVersion"]).toBe(CURRENT_SCHEMA_VERSION);
    expect((result["project"] as Record<string, unknown>)["name"]).toBe("test");
  });

  it("passes through data at the current schema version", () => {
    const input = { schemaVersion: CURRENT_SCHEMA_VERSION, project: { name: "test" } };

    const result = migrateManifest(input);

    expect(result["schemaVersion"]).toBe(CURRENT_SCHEMA_VERSION);
    expect(result).toEqual(input);
  });

  it("throws when the version is newer than supported", () => {
    const futureVersion = String(Number(CURRENT_SCHEMA_VERSION) + 1);

    expect(() =>
      migrateManifest({ schemaVersion: futureVersion, project: { name: "test" } }),
    ).toThrow("newer than the supported version");
  });

  it("throws when no migration path exists for an old version", () => {
    // Version "0" is older than current but has no migration registered
    expect(() =>
      migrateManifest({ schemaVersion: "0", project: { name: "test" } }),
    ).toThrow("No migration path");
  });

  it("throws when input is not an object", () => {
    expect(() => migrateManifest("not an object")).toThrow("must be a JSON object");
    expect(() => migrateManifest(null)).toThrow("must be a JSON object");
    expect(() => migrateManifest(42)).toThrow("must be a JSON object");
  });

  it("throws when input is an array", () => {
    expect(() => migrateManifest([1, 2, 3])).toThrow("must be a JSON object");
  });
});
