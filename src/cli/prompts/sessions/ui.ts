import { select } from "@inquirer/prompts";

export const uiSession = {
  id: "ui",
  title: "UI Conventions",
  prompt: "Capture component, layout, chart, and form conventions.",
};

export type UiAnswers = {
  styling: "tailwind" | "custom";
  components: "shadcn-ui" | "custom-design-system";
  charts: "recharts" | "echarts" | "nivo" | "custom";
  forms: "react-hook-form-zod" | "custom";
  tables: "tanstack-table" | "ag-grid" | "custom";
};

export async function runUiPrompt(): Promise<UiAnswers> {
  const styling = await select({
    message: "CSS / styling approach?",
    choices: [
      { name: "Tailwind CSS", value: "tailwind" as const },
      { name: "Custom", value: "custom" as const },
    ],
  });

  const components = await select({
    message: "Component library?",
    choices: [
      { name: "shadcn/ui", value: "shadcn-ui" as const },
      { name: "Custom design system", value: "custom-design-system" as const },
    ],
  });

  const charts = await select({
    message: "Charts library?",
    choices: [
      { name: "Recharts", value: "recharts" as const },
      { name: "ECharts", value: "echarts" as const },
      { name: "Nivo", value: "nivo" as const },
      { name: "Custom", value: "custom" as const },
    ],
  });

  const forms = await select({
    message: "Forms library?",
    choices: [
      { name: "React Hook Form + Zod", value: "react-hook-form-zod" as const },
      { name: "Custom", value: "custom" as const },
    ],
  });

  const tables = await select({
    message: "Tables library?",
    choices: [
      { name: "TanStack Table", value: "tanstack-table" as const },
      { name: "AG Grid", value: "ag-grid" as const },
      { name: "Custom", value: "custom" as const },
    ],
  });

  return { styling, components, charts, forms, tables };
}
