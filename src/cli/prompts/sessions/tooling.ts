import { checkbox } from "@inquirer/prompts";

export const toolingSession = {
  id: "tooling",
  title: "Tooling and MCP",
  prompt: "Capture MCP presets, docs sources, shell rules, and repo tooling needs.",
};

export async function runToolingPrompt(): Promise<string[]> {
  return checkbox({
    message: "Include any MCP presets?",
    choices: [
      { name: "Filesystem", value: "filesystem" },
      { name: "GitHub", value: "github" },
      { name: "Postgres", value: "postgres" },
      { name: "None", value: "__none__" },
    ],
  }).then((selected) => selected.filter((s) => s !== "__none__"));
}
