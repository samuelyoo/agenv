export type TemplateDefinition = {
  id: string;
  name: string;
  projectType: "dashboard";
  framework: "react" | "nextjs" | "vite-react";
  setupDepth: "recommended" | "semi-custom";
  defaultTargets: string[];
  description: string;
};

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: "dashboard-nextjs-recommended",
    name: "Dashboard Next.js Recommended",
    projectType: "dashboard",
    framework: "nextjs",
    setupDepth: "recommended",
    defaultTargets: ["codex", "copilot", "claude"],
    description: "Opinionated Next.js dashboard setup with shared AI workspace defaults.",
  },
  {
    id: "dashboard-vite-react-recommended",
    name: "Dashboard Vite React Recommended",
    projectType: "dashboard",
    framework: "vite-react",
    setupDepth: "recommended",
    defaultTargets: ["codex", "copilot", "claude"],
    description: "Lean Vite React internal-tool setup with dashboard-first defaults.",
  },
  {
    id: "dashboard-react-semi-custom",
    name: "Dashboard React Semi-custom",
    projectType: "dashboard",
    framework: "react",
    setupDepth: "semi-custom",
    defaultTargets: ["codex", "copilot", "claude", "mcp"],
    description: "Manual-friendly React dashboard starter with broader tool selection.",
  },
];
