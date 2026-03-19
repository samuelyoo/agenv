import { select } from "@inquirer/prompts";

export const authSession = {
  id: "auth",
  title: "Auth and RBAC",
  prompt: "Capture role-based access control and protected UI requirements.",
};

export async function runAuthPrompt(): Promise<"rbac" | "none" | "custom"> {
  return select({
    message: "Auth / access-control model?",
    choices: [
      { name: "Role-Based Access Control (RBAC)", value: "rbac" as const },
      { name: "None", value: "none" as const },
      { name: "Custom", value: "custom" as const },
    ],
  });
}
