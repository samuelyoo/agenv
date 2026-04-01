import type { PackDefinition } from "./schema.js";

export const BUILTIN_PACKS: PackDefinition[] = [
  {
    id: "secure-defaults",
    name: "Secure Defaults",
    description: "Adds security-focused coding style and review rules.",
    version: "1.0.0",
    source: "builtin",
    manifest: {
      instructions: {
        codingStyle: [
          "Sanitize all user input at system boundaries.",
          "Never log sensitive data such as passwords, tokens, or PII.",
          "Use parameterized queries for all database access.",
        ],
        reviewRules: [
          "Check that all external input is validated before use.",
          "Verify error messages do not leak internal implementation details.",
          "Ensure authentication and authorization checks are present on all protected routes.",
        ],
      },
    },
  },
  {
    id: "strict-typescript",
    name: "Strict TypeScript",
    description: "Adds strict TypeScript coding conventions.",
    version: "1.0.0",
    source: "builtin",
    manifest: {
      instructions: {
        codingStyle: [
          "Enable all strict compiler options in tsconfig.json.",
          "Prefer unknown over any for untyped values.",
          "Use branded types for domain identifiers.",
        ],
        reviewRules: [
          "Reject any use of the any type without a documented justification.",
          "Verify all type assertions have an accompanying comment explaining why they are safe.",
        ],
      },
    },
  },
  {
    id: "testing-essentials",
    name: "Testing Essentials",
    description: "Adds testing best-practice review rules and conventions.",
    version: "1.0.0",
    source: "builtin",
    manifest: {
      instructions: {
        codingStyle: [
          "Write tests before implementation when adding new features.",
          "Keep test files co-located or mirrored with source structure.",
        ],
        reviewRules: [
          "Every new public function must have at least one unit test.",
          "Integration tests must clean up all temporary files and state.",
          "Do not merge code that decreases overall test coverage.",
        ],
      },
    },
  },
];

export const VALID_PACK_IDS: string[] = BUILTIN_PACKS.map((p) => p.id);

export function getPackById(id: string): PackDefinition | undefined {
  return BUILTIN_PACKS.find((p) => p.id === id);
}

export function listPacks(): PackDefinition[] {
  return BUILTIN_PACKS;
}
