export type TrustLevel = "safe" | "review" | "dangerous";

export type McpPresetCategory = "code" | "data" | "search" | "productivity" | "utility";

export type McpPreset = {
  id: string;
  name: string;
  description: string;
  category: McpPresetCategory;
  command: string;
  args: string[];
  env: Record<string, string>;
  trustLevel: TrustLevel;
};

export const MCP_PRESETS: McpPreset[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Read and write GitHub repos, issues, and pull requests.",
    category: "code",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: {
      GITHUB_TOKEN: "${GITHUB_TOKEN}",
    },
    trustLevel: "review",
  },
  {
    id: "filesystem",
    name: "Filesystem",
    description: "Read and write files on the local filesystem.",
    category: "utility",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
    env: {},
    trustLevel: "dangerous",
  },
  {
    id: "postgres",
    name: "Postgres",
    description: "Query and inspect a PostgreSQL database.",
    category: "data",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres"],
    env: {
      POSTGRES_URL: "${POSTGRES_URL}",
    },
    trustLevel: "review",
  },
  {
    id: "sqlite",
    name: "SQLite",
    description: "Query and inspect a local SQLite database.",
    category: "data",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./local.db"],
    env: {},
    trustLevel: "review",
  },
  {
    id: "brave-search",
    name: "Brave Search",
    description: "Perform web searches using the Brave Search API.",
    category: "search",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    env: {
      BRAVE_API_KEY: "${BRAVE_API_KEY}",
    },
    trustLevel: "safe",
  },
  {
    id: "memory",
    name: "Memory",
    description: "Persistent key-value memory for cross-session context.",
    category: "utility",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
    env: {},
    trustLevel: "safe",
  },
  {
    id: "fetch",
    name: "Fetch",
    description: "Make HTTP requests to external URLs.",
    category: "utility",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-fetch"],
    env: {},
    trustLevel: "review",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Read and write Slack messages and channels.",
    category: "productivity",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    env: {
      SLACK_BOT_TOKEN: "${SLACK_BOT_TOKEN}",
      SLACK_TEAM_ID: "${SLACK_TEAM_ID}",
    },
    trustLevel: "review",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Manage Linear issues, cycles, and projects.",
    category: "productivity",
    command: "npx",
    args: ["-y", "@linear/mcp-server"],
    env: {
      LINEAR_API_KEY: "${LINEAR_API_KEY}",
    },
    trustLevel: "review",
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Query Sentry errors, events, and project data.",
    category: "code",
    command: "npx",
    args: ["-y", "@sentry/mcp-server"],
    env: {
      SENTRY_AUTH_TOKEN: "${SENTRY_AUTH_TOKEN}",
      SENTRY_ORG: "${SENTRY_ORG}",
    },
    trustLevel: "safe",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Read and write Notion pages, databases, and blocks.",
    category: "productivity",
    command: "npx",
    args: ["-y", "@notionhq/notion-mcp-server"],
    env: {
      NOTION_API_KEY: "${NOTION_API_KEY}",
    },
    trustLevel: "safe",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Manage Stripe customers, invoices, products, and payments.",
    category: "productivity",
    command: "npx",
    args: ["-y", "@stripe/mcp-server", "--tools=all"],
    env: {
      STRIPE_SECRET_KEY: "${STRIPE_SECRET_KEY}",
    },
    trustLevel: "review",
  },
  {
    id: "atlassian",
    name: "Atlassian",
    description: "Read and write Jira issues, Confluence pages, and project data.",
    category: "productivity",
    command: "npx",
    args: ["-y", "@atlassian/mcp-server"],
    env: {
      ATLASSIAN_API_TOKEN: "${ATLASSIAN_API_TOKEN}",
      ATLASSIAN_EMAIL: "${ATLASSIAN_EMAIL}",
      ATLASSIAN_BASE_URL: "${ATLASSIAN_BASE_URL}",
    },
    trustLevel: "review",
  },
  {
    id: "puppeteer",
    name: "Puppeteer",
    description: "Control a headless browser for scraping, screenshots, and automation.",
    category: "utility",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    env: {},
    trustLevel: "dangerous",
  },
  {
    id: "sequential-thinking",
    name: "Sequential Thinking",
    description: "Enable structured, multi-step reasoning for complex problem solving.",
    category: "utility",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    env: {},
    trustLevel: "safe",
  },
];

export const VALID_PRESET_IDS = MCP_PRESETS.map((p) => p.id);

export function getPresetById(id: string): McpPreset | undefined {
  return MCP_PRESETS.find((p) => p.id === id);
}

export function getPresetsByCategory(category: McpPresetCategory): McpPreset[] {
  return MCP_PRESETS.filter((p) => p.category === category);
}

export function validatePresetIds(ids: string[]): { valid: string[]; invalid: string[] } {
  const valid = ids.filter((id) => VALID_PRESET_IDS.includes(id));
  const invalid = ids.filter((id) => !VALID_PRESET_IDS.includes(id));
  return { valid, invalid };
}
