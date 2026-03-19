import { select } from "@inquirer/prompts";

export const setupDepthSession = {
  id: "setup-depth",
  title: "Setup Depth",
  prompt: "Choose recommended, semi-custom, or advanced setup depth.",
};

export async function runSetupDepthPrompt(): Promise<"recommended" | "semi-custom" | "advanced"> {
  return select({
    message: "How much control do you want over the configuration?",
    choices: [
      { name: "Recommended — sensible defaults, minimal input", value: "recommended" as const },
      { name: "Semi-custom — adjust key settings", value: "semi-custom" as const },
      { name: "Advanced — full control over every option", value: "advanced" as const },
    ],
  });
}
