import { access } from "node:fs/promises";
import { basename, join } from "node:path";
import { detectDashboardHints } from "./dependencies.js";
import { detectExistingAiFiles } from "./existing-ai-files.js";
import { detectFrameworkFromDependencies, type DetectedFramework } from "./frameworks.js";
import { getAllDependencies, loadPackageJson } from "./package-json.js";

export type RepoInspection = {
  projectName: string;
  framework: DetectedFramework | undefined;
  packageManager: "npm" | "pnpm" | "yarn" | undefined;
  existingAiFiles: string[];
  hints: ReturnType<typeof detectDashboardHints>;
};

async function detectPackageManager(
  cwd: string,
): Promise<RepoInspection["packageManager"]> {
  const candidates: Array<[string, RepoInspection["packageManager"]]> = [
    ["package-lock.json", "npm"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
  ];

  for (const [fileName, manager] of candidates) {
    try {
      await access(join(cwd, fileName));
      return manager;
    } catch {
      // Keep looking.
    }
  }

  return undefined;
}

export async function inspectRepo(cwd: string): Promise<RepoInspection> {
  const packageJson = await loadPackageJson(cwd);
  const dependencies = getAllDependencies(packageJson);

  return {
    projectName: packageJson?.name ?? basename(cwd),
    framework: detectFrameworkFromDependencies(dependencies),
    packageManager: await detectPackageManager(cwd),
    existingAiFiles: await detectExistingAiFiles(cwd),
    hints: detectDashboardHints(dependencies),
  };
}
