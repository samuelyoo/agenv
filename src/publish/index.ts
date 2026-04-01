import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { packDefinitionSchema } from "../packs/schema.js";
import { PublishError } from "../errors.js";
import { buildArtifact, writeArtifact, type PackArtifact } from "./artifact.js";

export type PublishResult = {
  artifact: PackArtifact;
  outputPath: string;
};

export async function publishPack(
  packDir: string,
  publisher: string,
): Promise<PublishResult> {
  const packJsonPath = join(packDir, "pack.json");
  let raw: unknown;
  try {
    const content = await readFile(packJsonPath, "utf8");
    raw = JSON.parse(content);
  } catch {
    throw new PublishError(`Cannot read pack.json at "${packDir}".`);
  }

  const parsed = packDefinitionSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new PublishError(`Invalid pack.json: ${issues.join(", ")}`);
  }

  const definition = { ...parsed.data, source: "local" as const };
  const artifact = buildArtifact(definition, publisher);
  const outputPath = await writeArtifact(packDir, artifact);

  return { artifact, outputPath };
}
