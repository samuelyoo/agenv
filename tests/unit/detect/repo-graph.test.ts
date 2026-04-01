import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { discoverRepoGraph } from "../../../src/detect/repo-graph.js";

const tempDirs: string[] = [];

async function makeTempDir() {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-graph-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
});

describe("discoverRepoGraph", () => {
  it("returns single-package for plain repo", async () => {
    const cwd = await makeTempDir();
    await writeFile(
      join(cwd, "package.json"),
      JSON.stringify({ name: "my-app" }),
    );

    const graph = await discoverRepoGraph(cwd);
    expect(graph.repoType).toBe("single-package");
    expect(graph.packages).toHaveLength(1);
    expect(graph.packages[0].name).toBe("my-app");
  });

  it("detects workspace from package.json workspaces field", async () => {
    const cwd = await makeTempDir();
    await writeFile(
      join(cwd, "package.json"),
      JSON.stringify({ name: "mono", workspaces: ["packages/*"] }),
    );
    await mkdir(join(cwd, "packages", "app-a"), { recursive: true });
    await writeFile(
      join(cwd, "packages", "app-a", "package.json"),
      JSON.stringify({ name: "app-a" }),
    );
    await mkdir(join(cwd, "packages", "lib-b"), { recursive: true });
    await writeFile(
      join(cwd, "packages", "lib-b", "package.json"),
      JSON.stringify({ name: "lib-b" }),
    );

    const graph = await discoverRepoGraph(cwd);
    expect(graph.repoType).toBe("workspace");
    expect(graph.packages.length).toBeGreaterThanOrEqual(2);
    expect(graph.packages.map((p) => p.name)).toEqual(
      expect.arrayContaining(["app-a", "lib-b"]),
    );
  });

  it("detects workspace from pnpm-workspace.yaml", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n");
    await mkdir(join(cwd, "packages", "core"), { recursive: true });
    await writeFile(
      join(cwd, "packages", "core", "package.json"),
      JSON.stringify({ name: "core" }),
    );

    const graph = await discoverRepoGraph(cwd);
    expect(graph.repoType).toBe("workspace");
    expect(graph.packages.some((p) => p.name === "core")).toBe(true);
  });

  it("detects monorepo from lerna.json", async () => {
    const cwd = await makeTempDir();
    await writeFile(
      join(cwd, "lerna.json"),
      JSON.stringify({ packages: ["packages/*"] }),
    );
    await mkdir(join(cwd, "packages", "svc"), { recursive: true });
    await writeFile(
      join(cwd, "packages", "svc", "package.json"),
      JSON.stringify({ name: "svc" }),
    );

    const graph = await discoverRepoGraph(cwd);
    expect(graph.repoType).toBe("monorepo");
    expect(graph.packages.some((p) => p.name === "svc")).toBe(true);
  });

  it("returns single-package when no workspace config found", async () => {
    const cwd = await makeTempDir();
    const graph = await discoverRepoGraph(cwd);
    expect(graph.repoType).toBe("single-package");
    expect(graph.packages).toHaveLength(1);
  });

  it("handles empty workspaces array", async () => {
    const cwd = await makeTempDir();
    await writeFile(
      join(cwd, "package.json"),
      JSON.stringify({ name: "empty-ws", workspaces: [] }),
    );

    const graph = await discoverRepoGraph(cwd);
    expect(graph.repoType).toBe("single-package");
  });
});
