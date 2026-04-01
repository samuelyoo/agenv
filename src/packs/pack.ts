import { join } from "node:path";
import { readJsonFile } from "../utils/json.js";
import { packDefinitionSchema } from "./schema.js";

export type PackValidationResult = {
  valid: boolean;
  id: string;
  name: string;
  description: string;
  version: string;
  errors: string[];
  warnings: string[];
};

export async function validateLocalPack(
  packDir: string,
): Promise<PackValidationResult> {
  const packJsonPath = join(packDir, "pack.json");
  const errors: string[] = [];
  const warnings: string[] = [];

  let raw: unknown;
  try {
    raw = await readJsonFile<unknown>(packJsonPath);
  } catch {
    return {
      valid: false,
      id: "",
      name: "",
      description: "",
      version: "",
      errors: [`Cannot read pack.json at "${packJsonPath}".`],
      warnings: [],
    };
  }

  const parsed = packDefinitionSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return {
      valid: false,
      id: "",
      name: "",
      description: "",
      version: "",
      errors: issues,
      warnings: [],
    };
  }

  const def = parsed.data;

  return {
    valid: true,
    id: def.id,
    name: def.name,
    description: def.description,
    version: def.version,
    errors,
    warnings,
  };
}
