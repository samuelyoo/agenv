import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { formatJson } from "../utils/json.js";
import type { Manifest } from "./schema.js";

export async function saveManifest(cwd: string, manifest: Manifest): Promise<string> {
  const manifestPath = join(cwd, "ai-workspace.json");

  await writeFile(manifestPath, formatJson(manifest), "utf8");

  return manifestPath;
}
