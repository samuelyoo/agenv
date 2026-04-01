import { join } from "node:path";
import { readJsonFile } from "../utils/json.js";
import { getPackById } from "./catalog.js";
import { packDefinitionSchema, type ManifestPackRef, type PackDefinition } from "./schema.js";

export type LoadedPack = {
  ref: ManifestPackRef;
  definition: PackDefinition;
};

export type LoadPacksResult = {
  loaded: LoadedPack[];
  errors: string[];
};

export async function loadPacks(
  cwd: string,
  refs: ManifestPackRef[],
): Promise<LoadPacksResult> {
  const loaded: LoadedPack[] = [];
  const errors: string[] = [];

  for (const ref of refs) {
    if (ref.source === "builtin") {
      const pack = getPackById(ref.id);
      if (pack === undefined) {
        errors.push(`Built-in pack "${ref.id}" not found.`);
        continue;
      }
      loaded.push({ ref, definition: pack });
    } else if (ref.source === "local") {
      const packPath = ref.path;
      if (packPath === undefined) {
        errors.push(`Local pack "${ref.id}" is missing a path.`);
        continue;
      }

      const packJsonPath = join(cwd, packPath, "pack.json");
      try {
        const raw = await readJsonFile<unknown>(packJsonPath);
        const parsed = packDefinitionSchema.safeParse(raw);
        if (!parsed.success) {
          const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
          errors.push(`Local pack "${ref.id}" at "${packPath}" has invalid pack.json: ${issues.join(", ")}`);
          continue;
        }
        loaded.push({
          ref,
          definition: {
            ...parsed.data,
            source: "local",
          },
        });
      } catch {
        errors.push(`Local pack "${ref.id}" at "${packPath}": cannot read pack.json.`);
      }
    }
  }

  return { loaded, errors };
}
