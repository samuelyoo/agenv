import type { Manifest } from "../manifest/schema.js";
import type { LoadedPack } from "./load.js";

export type ResolveResult = {
  resolvedManifest: Manifest;
  applied: string[];
  warnings: string[];
};

function dedup(arr: string[]): string[] {
  return [...new Set(arr)];
}

export function resolvePacks(
  manifest: Manifest,
  loadedPacks: LoadedPack[],
): ResolveResult {
  if (loadedPacks.length === 0) {
    return { resolvedManifest: manifest, applied: [], warnings: [] };
  }

  const applied: string[] = [];
  const warnings: string[] = [];

  // Deep clone to avoid mutating the original
  const resolved: Manifest = JSON.parse(JSON.stringify(manifest)) as Manifest;

  for (const { definition } of loadedPacks) {
    const fragment = definition.manifest;
    applied.push(definition.id);

    // Merge instructions
    if (fragment.instructions !== undefined) {
      if (fragment.instructions.codingStyle !== undefined) {
        resolved.instructions.codingStyle = dedup([
          ...resolved.instructions.codingStyle,
          ...fragment.instructions.codingStyle,
        ]);
      }
      if (fragment.instructions.reviewRules !== undefined) {
        resolved.instructions.reviewRules = dedup([
          ...resolved.instructions.reviewRules,
          ...fragment.instructions.reviewRules,
        ]);
      }
    }

    // Merge generated.mcpPresets
    if (fragment.generated?.mcpPresets !== undefined) {
      resolved.generated.mcpPresets = dedup([
        ...resolved.generated.mcpPresets,
        ...fragment.generated.mcpPresets,
      ]);
    }

    // Merge extensions (pack values don't override existing keys)
    if (fragment.extensions !== undefined) {
      const existing = resolved.extensions ?? {};
      const merged: Record<string, unknown> = { ...existing };
      for (const [key, value] of Object.entries(fragment.extensions)) {
        if (!(key in merged)) {
          merged[key] = value;
        }
      }
      resolved.extensions = merged;
    }

    // Merge conventions (only apply if field is not already set to non-default)
    if (fragment.conventions !== undefined) {
      for (const [key, value] of Object.entries(fragment.conventions)) {
        const currentValue = resolved.conventions[key as keyof typeof resolved.conventions];
        if (currentValue === undefined) {
          // Safe to apply pack value
          (resolved.conventions as Record<string, unknown>)[key] = value;
        }
      }
    }
  }

  return { resolvedManifest: resolved, applied, warnings };
}
