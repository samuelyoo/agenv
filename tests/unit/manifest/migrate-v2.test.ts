import { describe, expect, it } from "vitest";
import { migrateManifest, CURRENT_SCHEMA_VERSION } from "../../../src/manifest/migrate.js";
import { manifestSchema } from "../../../src/manifest/schema.js";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";

describe("v1 to v2 migration", () => {
  it("migrates v1 manifest to v2 by bumping version", () => {
    const v1Data = {
      schemaVersion: "1",
      project: { name: "test", type: "web-app", framework: "react", language: "ts" },
    };

    const result = migrateManifest(v1Data);
    expect(result["schemaVersion"]).toBe("2");
  });

  it("leaves v2 manifest untouched", () => {
    const v2Data = {
      schemaVersion: "2",
      project: { name: "test", type: "web-app", framework: "react", language: "ts" },
    };

    const result = migrateManifest(v2Data);
    expect(result["schemaVersion"]).toBe("2");
    expect(result).toEqual(v2Data);
  });

  it("rejects v3 future manifest", () => {
    expect(() =>
      migrateManifest({ schemaVersion: "3", project: { name: "test" } }),
    ).toThrow("newer than the supported version");
  });

  it("round-trip: v1 manifest migrates then parses as valid v2", () => {
    const v1Manifest = buildRecommendedManifest({ name: "roundtrip", framework: "react" });
    // Simulate v1 by downgrading version
    const v1Raw = JSON.parse(JSON.stringify(v1Manifest)) as Record<string, unknown>;
    v1Raw["schemaVersion"] = "1";

    const migrated = migrateManifest(v1Raw);
    const result = manifestSchema.safeParse(migrated);
    expect(result.success).toBe(true);
  });

  it("migrated manifest preserves all existing fields", () => {
    const original = buildRecommendedManifest({ name: "preserve", framework: "nextjs", projectType: "full-stack" });
    const raw = JSON.parse(JSON.stringify(original)) as Record<string, unknown>;
    raw["schemaVersion"] = "1";

    const migrated = migrateManifest(raw);
    expect(migrated["schemaVersion"]).toBe("2");
    expect((migrated["project"] as Record<string, unknown>)["name"]).toBe("preserve");
    expect((migrated["project"] as Record<string, unknown>)["framework"]).toBe("nextjs");
    expect((migrated["project"] as Record<string, unknown>)["type"]).toBe("full-stack");
  });
});
