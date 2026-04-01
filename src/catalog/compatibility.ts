import type { CatalogEntry } from "./index.js";
import type { Manifest } from "../manifest/schema.js";

export type CompatibilityResult = {
  compatible: boolean;
  warnings: string[];
};

export function checkCompatibility(
  entry: CatalogEntry,
  manifest: Manifest,
): CompatibilityResult {
  const warnings: string[] = [];

  const { targets, projectTypes, languages } = entry.compatibility;

  if (targets !== undefined && targets.length > 0) {
    const enabledTargets = Object.entries(manifest.targets)
      .filter(([, enabled]) => enabled === true)
      .map(([name]) => name);
    for (const t of targets) {
      if (!enabledTargets.includes(t)) {
        warnings.push(`Target "${t}" is required by pack but not enabled in manifest.`);
      }
    }
  }

  if (projectTypes !== undefined && projectTypes.length > 0) {
    if (!projectTypes.includes(manifest.project.type)) {
      warnings.push(
        `Project type "${manifest.project.type}" is not in pack's supported types: ${projectTypes.join(", ")}.`,
      );
    }
  }

  if (languages !== undefined && languages.length > 0) {
    if (!languages.includes(manifest.project.language)) {
      warnings.push(
        `Language "${manifest.project.language}" is not in pack's supported languages: ${languages.join(", ")}.`,
      );
    }
  }

  return {
    compatible: warnings.length === 0,
    warnings,
  };
}
