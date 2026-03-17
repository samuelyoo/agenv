import { access } from "node:fs/promises";
import { join } from "node:path";

const KNOWN_AI_PATHS = [
  "AGENTS.md",
  "ai-workspace.json",
  ".github/copilot-instructions.md",
  ".claude",
  ".mcp.json",
];

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function detectExistingAiFiles(cwd: string): Promise<string[]> {
  const results = await Promise.all(
    KNOWN_AI_PATHS.map(async (relativePath) => {
      const exists = await pathExists(join(cwd, relativePath));
      return exists ? relativePath : null;
    }),
  );

  return results.filter((value): value is string => value !== null);
}
