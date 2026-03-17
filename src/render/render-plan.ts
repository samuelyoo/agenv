import { getAdapter } from "../adapters/index.js";
import type { AdapterId, RenderedFile } from "../adapters/types.js";
import type { Manifest } from "../manifest/schema.js";
import type { GenerationPlan } from "../planner/build-plan.js";
import { applyGeneratedHeader } from "../fs/headers.js";
import { renderSharedFile } from "./shared.js";

export function renderPlanFiles(
  manifest: Manifest,
  generationPlan: GenerationPlan,
): RenderedFile[] {
  return generationPlan.files.map((file) => {
    const rendered =
      file.target === "shared"
        ? renderSharedFile(file, manifest)
        : getAdapter(file.target as AdapterId).render(file, manifest);

    return {
      ...rendered,
      content: applyGeneratedHeader(rendered.path, rendered.content),
    };
  });
}
