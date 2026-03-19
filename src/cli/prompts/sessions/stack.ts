import { select } from "@inquirer/prompts";

export const stackSession = {
  id: "stack",
  title: "Stack Profile",
  prompt: "Capture the framework and frontend stack choices for the repository.",
};

const FRONTEND_FRAMEWORKS = [
  { name: "React", value: "react" as const },
  { name: "Next.js", value: "nextjs" as const },
  { name: "Vite + React", value: "vite-react" as const },
];

const BACKEND_FRAMEWORKS = [
  { name: "Express", value: "express" as const },
  { name: "Fastify", value: "fastify" as const },
  { name: "Hono", value: "hono" as const },
];

export async function runStackPrompt(
  detected?: string,
  projectType?: string,
): Promise<"react" | "nextjs" | "vite-react" | "express" | "fastify" | "hono"> {
  const isApi = projectType === "api-service";
  const choices = isApi ? BACKEND_FRAMEWORKS : FRONTEND_FRAMEWORKS;
  const defaultValue = isApi
    ? ("express" as const)
    : ((detected ?? "react") as "react" | "nextjs" | "vite-react");

  return select({
    message: detected
      ? `Detected framework: ${detected}. Confirm or change:`
      : `Which framework does this project use?`,
    choices,
    default: defaultValue,
  });
}
