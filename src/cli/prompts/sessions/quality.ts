import { checkbox, confirm } from "@inquirer/prompts";

export const qualitySession = {
  id: "quality",
  title: "Quality Rules",
  prompt: "Capture testing, accessibility, responsive behavior, and review rules.",
};

export type QualityAnswers = {
  testing: ("vitest" | "rtl" | "playwright")[];
  accessibility: boolean;
  responsive: boolean;
};

export async function runQualityPrompt(): Promise<QualityAnswers> {
  const testing = await checkbox({
    message: "Which testing tools should be enforced?",
    choices: [
      { name: "Vitest", value: "vitest" as const, checked: true },
      { name: "React Testing Library", value: "rtl" as const, checked: true },
      { name: "Playwright", value: "playwright" as const, checked: false },
    ],
  });

  const accessibility = await confirm({
    message: "Enforce accessibility rules?",
    default: true,
  });

  const responsive = await confirm({
    message: "Enforce responsive design rules?",
    default: true,
  });

  return { testing: testing.length > 0 ? testing : ["vitest"], accessibility, responsive };
}
