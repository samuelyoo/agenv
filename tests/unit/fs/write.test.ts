import { mkdtemp, writeFile, readFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { writeRenderedFiles } from "../../../src/fs/write.js";
import { GENERATED_NOTICE } from "../../../src/fs/headers.js";
import type { RenderedFile } from "../../../src/adapters/types.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-write-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((cwd) => rm(cwd, { recursive: true, force: true })));
});

function makeRendered(path: string, content: string): RenderedFile {
  return { path, content };
}

describe("writeRenderedFiles", () => {
  it("creates new files and reports them as created", async () => {
    const cwd = await makeTempDir();

    const summary = await writeRenderedFiles(cwd, [
      makeRendered("AGENTS.md", `<!-- ${GENERATED_NOTICE} -->\n\n# Agents`),
      makeRendered("docs/readme.md", `<!-- ${GENERATED_NOTICE} -->\n\nHello`),
    ]);

    expect(summary.created).toEqual(["AGENTS.md", "docs/readme.md"]);
    expect(summary.updated).toEqual([]);
    expect(summary.unchanged).toEqual([]);
    expect(summary.skipped).toEqual([]);

    const content = await readFile(join(cwd, "AGENTS.md"), "utf8");
    expect(content).toContain("# Agents");
  });

  it("reports unchanged when content matches", async () => {
    const cwd = await makeTempDir();
    const content = `<!-- ${GENERATED_NOTICE} -->\n\n# Agents`;
    await writeFile(join(cwd, "AGENTS.md"), content, "utf8");

    const summary = await writeRenderedFiles(cwd, [makeRendered("AGENTS.md", content)]);

    expect(summary.unchanged).toEqual(["AGENTS.md"]);
    expect(summary.created).toEqual([]);
    expect(summary.updated).toEqual([]);
  });

  it("updates files that have a generated header and different content", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "AGENTS.md"), `<!-- ${GENERATED_NOTICE} -->\n\nOld`, "utf8");

    const summary = await writeRenderedFiles(cwd, [
      makeRendered("AGENTS.md", `<!-- ${GENERATED_NOTICE} -->\n\nNew`),
    ]);

    expect(summary.updated).toEqual(["AGENTS.md"]);
    expect(summary.backedUp).toEqual(["AGENTS.md"]);

    const updatedContent = await readFile(join(cwd, "AGENTS.md"), "utf8");
    expect(updatedContent).toContain("New");
  });

  it("skips user-modified markdown files without --force", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "AGENTS.md"), "# My custom content\n", "utf8");

    const summary = await writeRenderedFiles(cwd, [
      makeRendered("AGENTS.md", `<!-- ${GENERATED_NOTICE} -->\n\nGenerated`),
    ]);

    expect(summary.skipped).toEqual(["AGENTS.md"]);
    expect(summary.updated).toEqual([]);

    // Original content should be preserved
    const content = await readFile(join(cwd, "AGENTS.md"), "utf8");
    expect(content).toBe("# My custom content\n");
  });

  it("overwrites user-modified files with --force and creates backups", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "AGENTS.md"), "# My custom content\n", "utf8");

    const summary = await writeRenderedFiles(
      cwd,
      [makeRendered("AGENTS.md", `<!-- ${GENERATED_NOTICE} -->\n\nGenerated`)],
      { force: true },
    );

    expect(summary.updated).toEqual(["AGENTS.md"]);
    expect(summary.backedUp).toEqual(["AGENTS.md"]);
    expect(summary.skipped).toEqual([]);

    // Content should be updated
    const content = await readFile(join(cwd, "AGENTS.md"), "utf8");
    expect(content).toContain("Generated");

    // Backup should exist
    const backupDir = join(cwd, ".agenv-backups");
    const entries = await readdir(backupDir);
    expect(entries.length).toBeGreaterThan(0);
  });

  it("does not skip non-headerable files (e.g. .json)", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "config.json"), '{"old": true}', "utf8");

    const summary = await writeRenderedFiles(cwd, [
      makeRendered("config.json", '{"new": true}'),
    ]);

    expect(summary.updated).toEqual(["config.json"]);
    expect(summary.skipped).toEqual([]);
  });
});
