import { select } from "@inquirer/prompts";
import type { ProjectType } from "../../../manifest/schema.js";

export const projectTypeSession = {
  id: "project-type",
  title: "Project Type",
  prompt: "Confirm the project type.",
};

export async function runProjectTypePrompt(): Promise<ProjectType> {
  return select({
    message: "What type of project is this?",
    choices: [
      { name: "Dashboard", value: "dashboard" as const },
      { name: "Web App", value: "web-app" as const },
      { name: "API Service", value: "api-service" as const },
      { name: "Full-Stack App", value: "full-stack" as const },
      { name: "Library / Package", value: "library" as const },
      { name: "CLI Tool", value: "cli-tool" as const },
      { name: "Mobile App (Expo)", value: "mobile" as const },
    ],
  });
}
