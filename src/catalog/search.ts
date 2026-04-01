import type { CatalogEntry } from "./index.js";

export function matchesQuery(entry: CatalogEntry, query: string): boolean {
  const lower = query.toLowerCase();
  return (
    entry.id.toLowerCase().includes(lower) ||
    entry.definition.name.toLowerCase().includes(lower) ||
    entry.description.toLowerCase().includes(lower)
  );
}
