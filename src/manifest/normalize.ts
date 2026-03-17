import { buildRecommendedManifest } from "./defaults.js";
import {
  localOverrideSchema,
  manifestSchema,
  type Framework,
  type Manifest,
} from "./schema.js";
import { isRecord } from "../utils/json.js";

function mergePlainObjects<T>(base: T, override: unknown): T {
  if (override === undefined) {
    return base;
  }

  if (Array.isArray(override)) {
    return override as T;
  }

  if (!isRecord(base) || !isRecord(override)) {
    return override as T;
  }

  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];

    if (Array.isArray(value)) {
      merged[key] = value;
      continue;
    }

    if (isRecord(current) && isRecord(value)) {
      merged[key] = mergePlainObjects(current, value);
      continue;
    }

    merged[key] = value;
  }

  return merged as T;
}

export type NormalizeManifestOptions = {
  projectName: string;
  framework?: Framework;
  localOverride?: unknown;
};

export function normalizeManifest(
  sharedInput: unknown,
  options: NormalizeManifestOptions,
): Manifest {
  const baseManifest = buildRecommendedManifest({
    name: options.projectName,
    framework: options.framework ?? "react",
  });

  const mergedShared = mergePlainObjects(baseManifest, sharedInput);
  const mergedWithLocal =
    options.localOverride === undefined
      ? mergedShared
      : mergePlainObjects(mergedShared, localOverrideSchema.parse(options.localOverride));

  return manifestSchema.parse(mergedWithLocal);
}
