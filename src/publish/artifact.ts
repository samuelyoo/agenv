import { createHash } from "node:crypto";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import type { PackDefinition } from "../packs/schema.js";

export type PackArtifact = {
  id: string;
  version: string;
  publisher: string;
  checksum: string;
  definition: PackDefinition;
};

export function buildArtifact(definition: PackDefinition, publisher: string): PackArtifact {
  const checksum = createHash("sha256")
    .update(JSON.stringify(definition.manifest))
    .digest("hex");

  return {
    id: definition.id,
    version: definition.version,
    publisher,
    checksum,
    definition,
  };
}

export async function writeArtifact(cwd: string, artifact: PackArtifact): Promise<string> {
  const fileName = `${artifact.id}-${artifact.version}.agenv-pack.json`;
  const outputPath = join(cwd, fileName);
  const content = JSON.stringify(artifact, null, 2) + "\n";
  await writeFile(outputPath, content, "utf8");
  return outputPath;
}
