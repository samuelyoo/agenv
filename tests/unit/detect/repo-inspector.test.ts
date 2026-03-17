import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { inspectRepo } from "../../../src/detect/repo-inspector.js";

const tempDirs: string[] = [];

async function makeTempRepo(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-test-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (cwd) => {
      await import("node:fs/promises").then(({ rm }) =>
        rm(cwd, { recursive: true, force: true }),
      );
    }),
  );
});

describe("inspectRepo", () => {
  it("detects framework, package manager, AI files, and dashboard hints", async () => {
    const cwd = await makeTempRepo();

    await writeFile(
      join(cwd, "package.json"),
      JSON.stringify(
        {
          name: "fixture-dashboard",
          dependencies: {
            next: "^15.0.0",
            react: "^19.0.0",
            "@tanstack/react-query": "^5.0.0",
            "@tanstack/react-table": "^8.0.0",
            "react-hook-form": "^7.0.0",
            zod: "^4.0.0",
          },
          devDependencies: {
            tailwindcss: "^4.0.0",
          },
        },
        null,
        2,
      ),
    );
    await writeFile(join(cwd, "package-lock.json"), "");
    await writeFile(join(cwd, "AGENTS.md"), "# Existing");
    await mkdir(join(cwd, ".claude"));

    const inspection = await inspectRepo(cwd);

    expect(inspection.projectName).toBe("fixture-dashboard");
    expect(inspection.framework).toBe("nextjs");
    expect(inspection.packageManager).toBe("npm");
    expect(inspection.existingAiFiles).toEqual(expect.arrayContaining(["AGENTS.md", ".claude"]));
    expect(inspection.hints).toEqual({
      styling: "tailwind",
      dataFetching: "tanstack-query",
      tables: "tanstack-table",
      forms: "react-hook-form-zod",
    });
  });

  it("falls back to the directory name when package.json is absent", async () => {
    const cwd = await makeTempRepo();

    const inspection = await inspectRepo(cwd);

    expect(inspection.projectName).toMatch(/^agenv-test-/);
    expect(inspection.framework).toBeUndefined();
    expect(inspection.packageManager).toBeUndefined();
    expect(inspection.existingAiFiles).toEqual([]);
  });
});
