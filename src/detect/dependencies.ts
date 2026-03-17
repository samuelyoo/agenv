export type DashboardHints = {
  styling: "tailwind" | undefined;
  dataFetching: "tanstack-query" | undefined;
  tables: "tanstack-table" | undefined;
  forms: "react-hook-form-zod" | undefined;
};

export function hasDependency(
  dependencies: Record<string, string>,
  dependencyName: string,
): boolean {
  return dependencyName in dependencies;
}

export function detectDashboardHints(
  dependencies: Record<string, string>,
): DashboardHints {
  return {
    styling: hasDependency(dependencies, "tailwindcss") ? "tailwind" : undefined,
    dataFetching: hasDependency(dependencies, "@tanstack/react-query")
      ? "tanstack-query"
      : undefined,
    tables: hasDependency(dependencies, "@tanstack/react-table")
      ? "tanstack-table"
      : undefined,
    forms:
      hasDependency(dependencies, "react-hook-form") &&
      hasDependency(dependencies, "zod")
        ? "react-hook-form-zod"
        : undefined,
  };
}
