import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createBackup, createBackups } from "../../../src/fs/backups.js";
import { BackupError } from "../../../src/errors.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-backup-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((cwd) => rm(cwd, { recursive: true, force: true })));
});

describe("createBackup", () => {
  it("copies the file to .agenv-backups with a timestamp", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "AGENTS.md"), "# Original content", "utf8");

    const backupPath = await createBackup(cwd, "AGENTS.md");

    expect(backupPath).toBeDefined();
    expect(backupPath).toContain(".agenv-backups");
    expect(backupPath).toMatch(/AGENTS\.\d{4}-\d{2}-\d{2}.*\.md$/);

    const backupContent = await readFile(backupPath!, "utf8");
    expect(backupContent).toBe("# Original content");
  });

  it("preserves directory structure inside .agenv-backups", async () => {
    const cwd = await makeTempDir();
    const { mkdir } = await import("node:fs/promises");
    await mkdir(join(cwd, "docs"), { recursive: true });
    await writeFile(join(cwd, "docs/readme.md"), "nested file", "utf8");

    const backupPath = await createBackup(cwd, "docs/readme.md");

    expect(backupPath).toContain(join(".agenv-backups", "docs"));
    const content = await readFile(backupPath!, "utf8");
    expect(content).toBe("nested file");
  });

  it("returns undefined when source file does not exist", async () => {
    const cwd = await makeTempDir();

    const result = await createBackup(cwd, "nonexistent.md");

    expect(result).toBeUndefined();
  });
});

describe("createBackups", () => {
  it("backs up multiple files and returns paths of created backups", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "a.md"), "file a", "utf8");
    await writeFile(join(cwd, "b.md"), "file b", "utf8");

    const paths = await createBackups(cwd, ["a.md", "b.md"]);

    expect(paths).toHaveLength(2);
    expect(paths[0]).toContain(".agenv-backups");
    expect(paths[1]).toContain(".agenv-backups");
  });

  it("skips files that do not exist", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "exists.md"), "content", "utf8");

    const paths = await createBackups(cwd, ["exists.md", "missing.md"]);

    expect(paths).toHaveLength(1);
  });

  it("returns empty array when no files exist", async () => {
    const cwd = await makeTempDir();

    const paths = await createBackups(cwd, ["x.md", "y.md"]);

    expect(paths).toEqual([]);
  });
});
