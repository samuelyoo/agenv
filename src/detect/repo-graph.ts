import { access, readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";

export type PackageNode = {
  name: string;
  path: string;
};

export type RepoGraph = {
  repoType: "single-package" | "workspace" | "monorepo";
  packages: PackageNode[];
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath: string): Promise<Record<string, unknown> | undefined> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

async function resolvePackages(cwd: string, globs: string[]): Promise<PackageNode[]> {
  const packages: PackageNode[] = [];

  for (const glob of globs) {
    // Support simple "dir/*" globs only — strip trailing /*
    const base = glob.replace(/\/\*$/, "");
    const parentDir = join(cwd, base);

    try {
      const entries = await readdir(parentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const pkgJsonPath = join(parentDir, entry.name, "package.json");
        const pkgJson = await readJson(pkgJsonPath);

        if (pkgJson) {
          packages.push({
            name: (pkgJson["name"] as string) ?? entry.name,
            path: join(base, entry.name),
          });
        }
      }
    } catch {
      // Directory doesn't exist or can't be read — skip.
    }
  }

  return packages;
}

export async function discoverRepoGraph(cwd: string): Promise<RepoGraph> {
  // Check for lerna.json (monorepo)
  const lernaJson = await readJson(join(cwd, "lerna.json"));
  if (lernaJson) {
    const lernaPackages = (lernaJson["packages"] as string[] | undefined) ?? ["packages/*"];
    const packages = await resolvePackages(cwd, lernaPackages);

    return {
      repoType: "monorepo",
      packages: packages.length > 0 ? packages : [{ name: basename(cwd), path: "." }],
    };
  }

  // Check for pnpm-workspace.yaml
  if (await fileExists(join(cwd, "pnpm-workspace.yaml"))) {
    try {
      const raw = await readFile(join(cwd, "pnpm-workspace.yaml"), "utf8");
      const globs = parsePnpmWorkspaceGlobs(raw);

      if (globs.length > 0) {
        const packages = await resolvePackages(cwd, globs);

        if (packages.length > 0) {
          return { repoType: "workspace", packages };
        }
      }
    } catch {
      // Fall through.
    }
  }

  // Check package.json workspaces field
  const rootPkgJson = await readJson(join(cwd, "package.json"));

  if (rootPkgJson) {
    const workspaces = rootPkgJson["workspaces"];

    if (Array.isArray(workspaces) && workspaces.length > 0) {
      const packages = await resolvePackages(cwd, workspaces as string[]);

      if (packages.length > 0) {
        return { repoType: "workspace", packages };
      }
    }

    return {
      repoType: "single-package",
      packages: [{ name: (rootPkgJson["name"] as string) ?? basename(cwd), path: "." }],
    };
  }

  // No package.json at all — still single-package
  return {
    repoType: "single-package",
    packages: [{ name: basename(cwd), path: "." }],
  };
}

function parsePnpmWorkspaceGlobs(raw: string): string[] {
  const globs: string[] = [];
  let inPackages = false;

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();

    if (trimmed === "packages:") {
      inPackages = true;
      continue;
    }

    if (inPackages) {
      if (trimmed.startsWith("- ")) {
        globs.push(trimmed.slice(2).trim());
      } else if (trimmed !== "") {
        break;
      }
    }
  }

  return globs;
}
