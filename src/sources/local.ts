import { createHash } from "node:crypto";
import { getPackById } from "../packs/catalog.js";
import { PackNotFoundError } from "../errors.js";
import type { ManifestPackRef } from "../packs/schema.js";
import type { ResolvedSource, SourceResolver } from "./types.js";

export class LocalResolver implements SourceResolver {
  async resolve(ref: ManifestPackRef): Promise<ResolvedSource> {
    const pack = getPackById(ref.id);
    if (pack === undefined) {
      throw new PackNotFoundError(ref.id);
    }

    const checksum = createHash("sha256")
      .update(JSON.stringify(pack.manifest))
      .digest("hex");

    return {
      definition: pack,
      checksum,
      sourceUrl: `local:${ref.id}`,
    };
  }
}
