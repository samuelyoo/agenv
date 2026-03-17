import { access } from "node:fs/promises";
import { join } from "node:path";
import { readJsonFile } from "../utils/json.js";

export type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export async function loadPackageJson(cwd: string): Promise<PackageJson | null> {
  const filePath = join(cwd, "package.json");

  try {
    await access(filePath);
    return await readJsonFile<PackageJson>(filePath);
  } catch {
    return null;
  }
}

export function getAllDependencies(
  packageJson: PackageJson | null,
): Record<string, string> {
  return {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };
}
