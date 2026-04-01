import type { ManifestPackRef, PackDefinition } from "../packs/schema.js";

export type ResolvedSource = {
  definition: PackDefinition;
  checksum: string;
  sourceUrl: string;
};

export type SourceResolver = {
  resolve(ref: ManifestPackRef): Promise<ResolvedSource>;
};
