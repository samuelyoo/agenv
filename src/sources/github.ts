import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { packDefinitionSchema, type ManifestPackRef } from "../packs/schema.js";
import type { ResolvedSource, SourceResolver } from "./types.js";
import { SourceResolutionError } from "../errors.js";

export class GitHubResolver implements SourceResolver {
  async resolve(ref: ManifestPackRef): Promise<ResolvedSource> {
    const packDir = ref.path;
    if (packDir === undefined) {
      throw new SourceResolutionError(
        `GitHub pack "${ref.id}" is missing a path (used as local file-based simulation).`,
      );
    }

    const manifestPath = join(packDir, "agenv-pack.json");
    let raw: unknown;
    try {
      const content = await readFile(manifestPath, "utf8");
      raw = JSON.parse(content);
    } catch {
      throw new SourceResolutionError(
        `Cannot read agenv-pack.json for GitHub pack "${ref.id}" at "${packDir}".`,
      );
    }

    const parsed = packDefinitionSchema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      throw new SourceResolutionError(
        `Invalid agenv-pack.json for GitHub pack "${ref.id}": ${issues.join(", ")}`,
      );
    }

    const definition = { ...parsed.data, source: "github" as const };
    const checksum = createHash("sha256")
      .update(JSON.stringify(definition.manifest))
      .digest("hex");
    const sourceUrl = `github:${ref.id}@${ref.version ?? "latest"}`;

    return { definition, checksum, sourceUrl };
  }
}
