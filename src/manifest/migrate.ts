import { isRecord } from "../utils/json.js";
import { ManifestValidationError } from "../errors.js";

export const CURRENT_SCHEMA_VERSION = "2";

type Migration = {
  from: string;
  to: string;
  migrate: (data: Record<string, unknown>) => Record<string, unknown>;
};

/**
 * Registry of schema migrations. Each migration transforms from one version to the next.
 * Add new migrations here as the schema evolves.
 *
 * Example for a future v1 → v2 migration:
 *
 *   { from: "1", to: "2", migrate: (data) => { ... return transformed; } }
 */
const MIGRATIONS: Migration[] = [
  {
    from: "1",
    to: "2",
    migrate: (data) => ({ ...data, schemaVersion: "2" }),
  },
];

function getSchemaVersion(data: unknown): string | undefined {
  if (isRecord(data) && typeof data["schemaVersion"] === "string") {
    return data["schemaVersion"];
  }
  return undefined;
}

/**
 * Apply any needed migrations to bring a raw manifest up to the current schema version.
 * Returns the (possibly migrated) data. Throws if the version is unrecognized or
 * newer than the current version.
 */
export function migrateManifest(data: unknown): Record<string, unknown> {
  if (!isRecord(data)) {
    throw new ManifestValidationError(["Manifest must be a JSON object."]);
  }

  const version = getSchemaVersion(data);

  if (version === undefined) {
    // No schemaVersion field — treat as current version
    return { ...data, schemaVersion: CURRENT_SCHEMA_VERSION };
  }

  if (version === CURRENT_SCHEMA_VERSION) {
    return data as Record<string, unknown>;
  }

  // Check if the version is newer than what we support
  const versionNum = Number(version);
  const currentNum = Number(CURRENT_SCHEMA_VERSION);

  if (!Number.isNaN(versionNum) && !Number.isNaN(currentNum) && versionNum > currentNum) {
    throw new ManifestValidationError([
      `Manifest schema version "${version}" is newer than the supported version "${CURRENT_SCHEMA_VERSION}". Please upgrade agenv.`,
    ]);
  }

  // Apply migrations in sequence
  let current = { ...(data as Record<string, unknown>) };
  let currentVersion = version;

  for (const migration of MIGRATIONS) {
    if (migration.from === currentVersion) {
      current = migration.migrate(current);
      currentVersion = migration.to;
    }
  }

  if (currentVersion !== CURRENT_SCHEMA_VERSION) {
    throw new ManifestValidationError([
      `No migration path from schema version "${version}" to "${CURRENT_SCHEMA_VERSION}".`,
    ]);
  }

  return current;
}
