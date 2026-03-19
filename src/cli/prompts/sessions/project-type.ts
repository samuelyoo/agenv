import { select } from "@inquirer/prompts";

export const projectTypeSession = {
  id: "project-type",
  title: "Project Type",
  prompt: "Confirm the project type. Current support includes dashboard, web-app, and api-service repositories.",
};

export async function runProjectTypePrompt(): Promise<"dashboard" | "web-app" | "api-service"> {
  return select({
    message: "What type of project is this?",
    choices: [
      { name: "Dashboard", value: "dashboard" as const },
      { name: "Web App", value: "web-app" as const },
      { name: "API Service", value: "api-service" as const },
    ],
  });
}
