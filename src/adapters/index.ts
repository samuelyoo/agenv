import { claudeAdapter } from "./claude/index.js";
import { codexAdapter } from "./codex/index.js";
import { copilotAdapter } from "./copilot/index.js";
import { mcpAdapter } from "./mcp/index.js";
import type { Adapter, AdapterId } from "./types.js";

export const ADAPTERS: Adapter[] = [
  codexAdapter,
  copilotAdapter,
  claudeAdapter,
  mcpAdapter,
];

export function getAdapter(adapterId: AdapterId): Adapter {
  const adapter = ADAPTERS.find((candidate) => candidate.id === adapterId);

  if (!adapter) {
    throw new Error(`No adapter registered for '${adapterId}'.`);
  }

  return adapter;
}
