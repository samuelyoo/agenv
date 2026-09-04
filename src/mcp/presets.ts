export type TrustLevel = "safe" | "review" | "dangerous";

export type McpPresetCategory = "code" | "data" | "search" | "productivity" | "utility";

type McpPresetBase = {
  id: string;
  name: string;
  description: string;
  category: McpPresetCategory;
  env: Record<string, string>;
  trustLevel: TrustLevel;
  sourceUrl: string;
  verifiedAt: string;
};

export type McpPreset = McpPresetBase &
  (
    | {
        transport: "stdio";
        command: string;
        args: string[];
      }
    | {
        transport: "http";
        url: string;
      }
  );

const VERIFIED_AT = "2026-09-04";

export const MCP_PRESETS: McpPreset[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Read and write GitHub repositories, issues, and pull requests through GitHub's hosted MCP server.",
    category: "code",
    transport: "http",
    url: "https://api.githubcopilot.com/mcp/",
    env: {},
    trustLevel: "review",
    sourceUrl: "https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "filesystem",
    name: "Filesystem",
    description: "Read and write files under the current project through the maintained reference server.",
    category: "utility",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem@2026.8.31", "."],
    env: {},
    trustLevel: "dangerous",
    sourceUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "memory",
    name: "Memory",
    description: "Store and retrieve graph-based memory through the maintained reference server.",
    category: "utility",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory@2026.8.31"],
    env: {},
    trustLevel: "safe",
    sourceUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-memory",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Read and update Linear issues and projects through Linear's hosted OAuth server.",
    category: "productivity",
    transport: "http",
    url: "https://mcp.linear.app/mcp",
    env: {},
    trustLevel: "review",
    sourceUrl: "https://linear.app/docs/mcp",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Investigate Sentry errors and project data through Sentry's hosted MCP server.",
    category: "code",
    transport: "http",
    url: "https://mcp.sentry.dev/mcp",
    env: {},
    trustLevel: "review",
    sourceUrl: "https://docs.sentry.io/product/sentry-mcp/",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Read and write Notion workspace content through Notion's hosted OAuth server.",
    category: "productivity",
    transport: "http",
    url: "https://mcp.notion.com/mcp",
    env: {},
    trustLevel: "review",
    sourceUrl: "https://developers.notion.com/guides/mcp/get-started-with-mcp",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Work with Stripe resources through Stripe's hosted OAuth server.",
    category: "productivity",
    transport: "http",
    url: "https://mcp.stripe.com",
    env: {},
    trustLevel: "review",
    sourceUrl: "https://docs.stripe.com/mcp",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "sequential-thinking",
    name: "Sequential Thinking",
    description: "Use a maintained reference server for structured, multi-step reasoning.",
    category: "utility",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking@2026.8.31"],
    env: {},
    trustLevel: "safe",
    sourceUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-sequential-thinking",
    verifiedAt: VERIFIED_AT,
  },
];

export const VALID_PRESET_IDS = MCP_PRESETS.map((preset) => preset.id);

export function getPresetById(id: string): McpPreset | undefined {
  return MCP_PRESETS.find((preset) => preset.id === id);
}

export function getPresetsByCategory(category: McpPresetCategory): McpPreset[] {
  return MCP_PRESETS.filter((preset) => preset.category === category);
}

export function validatePresetIds(ids: string[]): { valid: string[]; invalid: string[] } {
  const valid = ids.filter((id) => VALID_PRESET_IDS.includes(id));
  const invalid = ids.filter((id) => !VALID_PRESET_IDS.includes(id));
  return { valid, invalid };
}
