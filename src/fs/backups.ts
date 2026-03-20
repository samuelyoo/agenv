import { copyFile, mkdir, access } from "node:fs/promises";
import { dirname, join, basename, extname } from "node:path";
import { BackupError } from "../errors.js";

const BACKUP_DIR = ".agenv-backups";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function buildBackupPath(cwd: string, relativePath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = extname(relativePath);
  const base = basename(relativePath, ext);
  const dir = dirname(relativePath);

  return join(cwd, BACKUP_DIR, dir, `${base}.${timestamp}${ext}`);
}

/**
 * Create a timestamped backup of a file before overwriting.
 * Backups are stored in `.agenv-backups/` mirroring the original directory structure.
 * Returns the backup path, or undefined if the source file does not exist.
 */
export async function createBackup(
  cwd: string,
  relativePath: string,
): Promise<string | undefined> {
  const sourcePath = join(cwd, relativePath);

  if (!(await fileExists(sourcePath))) {
    return undefined;
  }

  const backupPath = buildBackupPath(cwd, relativePath);

  try {
    await mkdir(dirname(backupPath), { recursive: true });
    await copyFile(sourcePath, backupPath);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "unknown error";
    throw new BackupError(relativePath, reason);
  }

  return backupPath;
}

/**
 * Create backups for multiple files. Returns paths of created backups.
 */
export async function createBackups(
  cwd: string,
  relativePaths: string[],
): Promise<string[]> {
  const results: string[] = [];
  for (const relativePath of relativePaths) {
    const backupPath = await createBackup(cwd, relativePath);
    if (backupPath !== undefined) {
      results.push(backupPath);
    }
  }
  return results;
}
