export type TemplateDefinition = {
  id: string;
  name: string;
  projectType: "dashboard" | "web-app" | "api-service";
  framework: "react" | "nextjs" | "vite-react" | "express" | "fastify" | "hono";
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
  {
    id: "web-app-nextjs-recommended",
    name: "Web App Next.js Recommended",
    projectType: "web-app",
    framework: "nextjs",
    setupDepth: "recommended",
    defaultTargets: ["codex", "copilot", "claude"],
    description: "Opinionated Next.js web app setup with shared AI workspace defaults.",
  },
  {
    id: "web-app-react-semi-custom",
    name: "Web App React Semi-custom",
    projectType: "web-app",
    framework: "react",
    setupDepth: "semi-custom",
    defaultTargets: ["codex", "copilot", "claude", "mcp"],
    description: "Manual-friendly React web app starter with broader tool selection.",
  },
  {
    id: "api-service-express-recommended",
    name: "API Service Express Recommended",
    projectType: "api-service",
    framework: "express",
    setupDepth: "recommended",
    defaultTargets: ["codex", "copilot", "claude"],
    description: "Opinionated Express API service setup with validation, testing, and auth defaults.",
  },
  {
    id: "api-service-fastify-recommended",
    name: "API Service Fastify Recommended",
    projectType: "api-service",
    framework: "fastify",
    setupDepth: "recommended",
    defaultTargets: ["codex", "copilot", "claude"],
    description: "Opinionated Fastify API service setup with schema-first validation and testing defaults.",
  },
];
