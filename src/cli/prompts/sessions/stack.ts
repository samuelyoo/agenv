import { select } from "@inquirer/prompts";
import type { Framework } from "../../../manifest/schema.js";

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
  { name: "Koa", value: "koa" as const },
  { name: "Django", value: "django" as const },
  { name: "Flask", value: "flask" as const },
  { name: "FastAPI", value: "fastapi" as const },
  { name: "Gin", value: "gin" as const },
  { name: "Echo", value: "echo" as const },
  { name: "Actix Web", value: "actix" as const },
  { name: "Axum", value: "axum" as const },
  { name: "Spring", value: "spring" as const },
  { name: "Rails", value: "rails" as const },
];

const GENERIC_FRAMEWORKS = [{ name: "No framework", value: "none" as const }];

export async function runStackPrompt(
  detected?: string,
  projectType?: string,
): Promise<Framework> {
  const isApi = projectType === "api-service";
  const isGeneric = projectType === "library" || projectType === "cli-tool";
  const choices = isApi ? BACKEND_FRAMEWORKS : isGeneric ? GENERIC_FRAMEWORKS : FRONTEND_FRAMEWORKS;
  const values = choices.map((choice) => choice.value as Framework);
  const fallback: Framework = isApi ? "express" : isGeneric ? "none" : "react";
  const defaultValue = detected && values.includes(detected as Framework)
    ? detected as Framework
    : fallback;

  return select<Framework>({
    message: detected
      ? `Detected framework: ${detected}. Confirm or change:`
      : `Which framework does this project use?`,
    choices,
    default: defaultValue,
  });
}
