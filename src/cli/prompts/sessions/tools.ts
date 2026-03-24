import { checkbox } from "@inquirer/prompts";

export const toolsSession = {
  id: "tools",
  title: "Tool Selection",
  prompt: "Choose which AI tools should be configured for this repository.",
};

export async function runToolsPrompt(): Promise<{
  copilot: boolean;
  claude: boolean;
  codex: boolean;
  mcp: boolean;
  cursor: boolean;
  windsurf: boolean;
}> {
  const selected = await checkbox({
    message: "Which AI tools should be configured?",
    choices: [
      { name: "GitHub Copilot", value: "copilot" as const, checked: true },
      { name: "Claude Code", value: "claude" as const, checked: true },
      { name: "OpenAI Codex", value: "codex" as const, checked: true },
      { name: "MCP Servers", value: "mcp" as const, checked: false },
      { name: "Cursor", value: "cursor" as const, checked: false },
      { name: "Windsurf", value: "windsurf" as const, checked: false },
    ],
  });

  return {
    copilot: selected.includes("copilot"),
    claude: selected.includes("claude"),
    codex: selected.includes("codex"),
    mcp: selected.includes("mcp"),
    cursor: selected.includes("cursor"),
    windsurf: selected.includes("windsurf"),
  };
}
