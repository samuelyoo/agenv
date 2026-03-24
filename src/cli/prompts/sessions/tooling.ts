import { checkbox, Separator } from "@inquirer/prompts";
import { MCP_PRESETS, getPresetById, type McpPresetCategory } from "../../../mcp/presets.js";

export const toolingSession = {
  id: "tooling",
  title: "Tooling and MCP",
  prompt: "Capture MCP presets, docs sources, shell rules, and repo tooling needs.",
};

const CATEGORY_ORDER: McpPresetCategory[] = ["code", "data", "search", "productivity", "utility"];
const CATEGORY_LABELS: Record<McpPresetCategory, string> = {
  code: "Code & Repos",
  data: "Databases & Data",
  search: "Search",
  productivity: "Productivity",
  utility: "Utilities",
};

export function buildToolingChoices(): Array<{ name: string; value: string } | Separator> {
  const choices: Array<{ name: string; value: string } | Separator> = [];

  for (const category of CATEGORY_ORDER) {
    const presetsInCategory = MCP_PRESETS.filter((p) => p.category === category);
    if (presetsInCategory.length === 0) continue;

    choices.push(new Separator(`── ${CATEGORY_LABELS[category]} ──`));
    for (const preset of presetsInCategory) {
      choices.push({
        name: `${preset.name} — ${preset.description}`,
        value: preset.id,
      });
    }
  }

  choices.push(new Separator("──────────────────────"));
  choices.push({ name: "None", value: "__none__" });

  return choices;
}

export async function runToolingPrompt(): Promise<string[]> {
  const selected = await checkbox({
    message: "Include any MCP presets?",
    choices: buildToolingChoices(),
  });
  const presetIds = selected.filter((s) => s !== "__none__");

  if (presetIds.length > 0) {
    const envVarLines: string[] = [];
    for (const id of presetIds) {
      const preset = getPresetById(id);
      if (!preset || Object.keys(preset.env).length === 0) continue;
      envVarLines.push(`  ${preset.name}:`);
      for (const key of Object.keys(preset.env)) {
        envVarLines.push(`    ${key}=`);
      }
    }
    if (envVarLines.length > 0) {
      console.log("\nRequired env vars for selected presets:");
      for (const line of envVarLines) {
        console.log(line);
      }
      console.log("Add these to your .env.local or CI secrets before running the MCP server.\n");
    }
  }

  return presetIds;
}
