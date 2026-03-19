import { select } from "@inquirer/prompts";

export const outputSession = {
  id: "output",
  title: "Output Strategy",
  prompt: "Choose setup mode, prompt generation behavior, and shared vs local scope.",
};

export type OutputAnswers = {
  mode: "base" | "skills" | "agents" | "full";
  scope: "shared" | "local" | "mixed";
  prompts: "none" | "starter" | "master" | "pack";
};

export async function runOutputPrompt(): Promise<OutputAnswers> {
  const mode = await select({
    message: "Setup mode — which files should be generated?",
    choices: [
      { name: "Base — instructions only", value: "base" as const },
      { name: "Skills — instructions + skill files", value: "skills" as const },
      { name: "Agents — instructions + agent definitions", value: "agents" as const },
      { name: "Full — everything", value: "full" as const },
    ],
    default: "full" as const,
  });

  const scope = await select({
    message: "Config scope — shared repo or local machine?",
    choices: [
      { name: "Shared — committed to the repo", value: "shared" as const },
      { name: "Local — gitignored, per-developer", value: "local" as const },
      { name: "Mixed — shared base with local overrides", value: "mixed" as const },
    ],
    default: "mixed" as const,
  });

  const prompts = await select({
    message: "Prompt generation level?",
    choices: [
      { name: "None — no prompt files", value: "none" as const },
      { name: "Starter — basic prompts", value: "starter" as const },
      { name: "Master — comprehensive prompts", value: "master" as const },
      { name: "Pack — full prompt pack", value: "pack" as const },
    ],
    default: "master" as const,
  });

  return { mode, scope, prompts };
}
