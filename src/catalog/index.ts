import type { PackDefinition } from "../packs/schema.js";
import { BUILTIN_PACKS } from "../packs/catalog.js";
import { matchesQuery } from "./search.js";

export type Compatibility = {
  targets?: string[];
  projectTypes?: string[];
  languages?: string[];
};

export type Provenance = {
  source: string;
  publisher: string;
};

export type CatalogEntry = {
  id: string;
  version: string;
  description: string;
  compatibility: Compatibility;
  provenance: Provenance;
  definition: PackDefinition;
};

const CATALOG: CatalogEntry[] = BUILTIN_PACKS.map((pack) => ({
  id: pack.id,
  version: pack.version,
  description: pack.description,
  compatibility: {},
  provenance: { source: "builtin", publisher: "agenv" },
  definition: pack,
}));

export function listCatalog(): CatalogEntry[] {
  return CATALOG;
}

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return CATALOG.find((e) => e.id === id);
}

export function searchCatalog(query: string): CatalogEntry[] {
  return CATALOG.filter((entry) => matchesQuery(entry, query));
}
