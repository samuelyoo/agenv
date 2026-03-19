import { select } from "@inquirer/prompts";

export const dataSession = {
  id: "data",
  title: "Data Patterns",
  prompt: "Capture data fetching, caching, typing, and API client patterns.",
};

export type DataAnswers = {
  dataFetching: "tanstack-query" | "custom";
  state: "local-first" | "zustand";
};

export async function runDataPrompt(): Promise<DataAnswers> {
  const dataFetching = await select({
    message: "Data fetching strategy?",
    choices: [
      { name: "TanStack Query", value: "tanstack-query" as const },
      { name: "Custom", value: "custom" as const },
    ],
  });

  const state = await select({
    message: "State management approach?",
    choices: [
      { name: "Local-first (React state + context)", value: "local-first" as const },
      { name: "Zustand", value: "zustand" as const },
    ],
  });

  return { dataFetching, state };
}
