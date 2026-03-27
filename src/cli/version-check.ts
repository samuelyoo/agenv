import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const CACHE_DIR = join(homedir(), ".agenv");
const CACHE_FILE = join(CACHE_DIR, "version-check.json");
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const REGISTRY_URL = "https://registry.npmjs.org/agenv-cli/latest";
const FETCH_TIMEOUT_MS = 3000;

type CacheData = {
  latestVersion: string;
  checkedAt: number;
};

function getInstalledVersion(): string {
  const require = createRequire(import.meta.url);
  const pkg = require("../../package.json") as { version: string };
  return pkg.version;
}

async function readCache(): Promise<CacheData | undefined> {
  try {
    const raw = await readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as CacheData;
  } catch {
    return undefined;
  }
}

async function writeCache(data: CacheData): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(data), "utf-8");
  } catch {
    // Silently ignore cache write failures
  }
}

async function fetchLatestVersion(): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(REGISTRY_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return undefined;

    const data = (await response.json()) as { version?: string };
    return data.version;
  } catch {
    return undefined;
  }
}

function isNewer(latest: string, current: string): boolean {
  const lParts = latest.split(".").map(Number);
  const cParts = current.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const l = lParts[i] ?? 0;
    const c = cParts[i] ?? 0;
    if (l !== c) return l > c;
  }
  return false;
}

/**
 * Checks if a newer version of agenv-cli is available on npm.
 * Uses a 24h file cache to avoid hitting the registry on every run.
 * Returns an update message string if outdated, or undefined if up to date.
 * Never throws — failures are silently ignored.
 */
export async function checkForUpdate(): Promise<string | undefined> {
  try {
    const current = getInstalledVersion();
    const cache = await readCache();

    if (cache && Date.now() - cache.checkedAt < CHECK_INTERVAL_MS) {
      if (isNewer(cache.latestVersion, current)) {
        return formatUpdateMessage(current, cache.latestVersion);
      }
      return undefined;
    }

    const latest = await fetchLatestVersion();
    if (!latest) return undefined;

    await writeCache({ latestVersion: latest, checkedAt: Date.now() });

    if (isNewer(latest, current)) {
      return formatUpdateMessage(current, latest);
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function formatUpdateMessage(current: string, latest: string): string {
  return `\n  Update available: ${current} → ${latest}\n  Run \`npm install -g agenv-cli@latest\` or \`agenv update\` to update.\n`;
}

/**
 * Runs the self-update by spawning npm install.
 */
export async function runSelfUpdate(): Promise<void> {
  const { execSync } = await import("node:child_process");
  execSync("npm install -g agenv-cli@latest", { stdio: "inherit" });
}
