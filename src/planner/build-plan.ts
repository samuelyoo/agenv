import type { Manifest, SetupMode } from "../manifest/schema.js";
import {
  OUTPUT_MAP,
  type AdapterTarget,
  type OutputLayer,
  type OutputScope,
  type PlanTarget,
} from "./output-map.js";
import { buildWarnings, type WarningMessage } from "./warnings.js";

export type PlannedFile = {
  target: PlanTarget;
  path: string;
  layer: OutputLayer;
  scope: OutputScope;
  purpose: string;
  generated: boolean;
  trustSensitive: boolean;
  status: "planned";
};

export type SkippedItem = {
  reason: string;
  target?: PlanTarget;
  path?: string;
};

export type GenerationPlan = {
  files: PlannedFile[];
  warnings: WarningMessage[];
  skipped: SkippedItem[];
};

export type BuildPlanOptions = {
  targets?: AdapterTarget[] | undefined;
  layers?: OutputLayer[] | undefined;
  scopes?: OutputScope[] | undefined;
};

function allowedLayersForMode(mode: SetupMode): OutputLayer[] {
  switch (mode) {
    case "base":
      return ["base"];
    case "skills":
      return ["base", "skills-agents"];
    case "agents":
    case "full":
      return ["base", "skills-agents", "prompts"];
  }
}

export function buildGenerationPlan(
  manifest: Manifest,
  options: BuildPlanOptions = {},
): GenerationPlan {
  const modeLayers = allowedLayersForMode(manifest.setup.mode);
  const selectedLayers =
    options.layers && options.layers.length > 0 ? options.layers : modeLayers;

  const files = OUTPUT_MAP.filter((entry) => {
    if (!entry.applies(manifest)) {
      return false;
    }

    if (!modeLayers.includes(entry.layer) || !selectedLayers.includes(entry.layer)) {
      return false;
    }

    if (
      options.scopes &&
      options.scopes.length > 0 &&
      !options.scopes.includes(entry.scope)
    ) {
      return false;
    }

    if (!options.targets || options.targets.length === 0) {
      return true;
    }

    return entry.target === "shared" || options.targets.includes(entry.target);
  }).map<PlannedFile>((entry) => ({
    target: entry.target,
    path: entry.path,
    layer: entry.layer,
    scope: entry.scope,
    purpose: entry.purpose,
    generated: entry.generated,
    trustSensitive: entry.trustSensitive,
    status: "planned",
  }));

  return {
    files,
    warnings: buildWarnings(manifest),
    skipped: [],
  };
}
