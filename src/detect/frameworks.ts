export type DetectedFramework = "react" | "nextjs" | "vite-react";

export function detectFrameworkFromDependencies(
  dependencies: Record<string, string>,
): DetectedFramework | undefined {
  if ("next" in dependencies) {
    return "nextjs";
  }

  if ("vite" in dependencies && "react" in dependencies) {
    return "vite-react";
  }

  if ("react" in dependencies) {
    return "react";
  }

  return undefined;
}
