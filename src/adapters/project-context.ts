import type { Framework, Language, Manifest, ProjectType } from "../manifest/schema.js";

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  dashboard: "dashboard",
  "web-app": "web application",
  "api-service": "API service",
  "full-stack": "full-stack application",
  library: "library",
  "cli-tool": "CLI tool",
  mobile: "mobile application",
};

const LANGUAGE_LABELS: Record<Language, string> = {
  ts: "TypeScript",
  python: "Python",
  go: "Go",
  rust: "Rust",
  java: "Java",
  ruby: "Ruby",
  other: "the repository's primary language",
};

const LANGUAGE_GLOBS: Record<Language, string> = {
  ts: "**/*.{ts,tsx}",
  python: "**/*.py",
  go: "**/*.go",
  rust: "**/*.rs",
  java: "**/*.java",
  ruby: "**/*.rb",
  other: "**/*",
};

const LANGUAGE_GUIDANCE: Record<Language, string[]> = {
  ts: ["Keep TypeScript strict and avoid weakening types with `any` unless the boundary is documented."],
  python: ["Use type hints on public APIs and follow the repository's configured formatter and linter."],
  go: ["Keep code formatted with `gofmt`, return errors explicitly, and follow standard package conventions."],
  rust: ["Keep code formatted with `rustfmt`, address `clippy` findings, and make ownership choices explicit."],
  java: ["Follow the repository's Java version, package conventions, and configured formatter and static analysis."],
  ruby: ["Follow the repository's Ruby version and configured RuboCop or project style rules."],
  other: ["Follow the language, formatter, linter, and test conventions already established in the repository."],
};

const FRAMEWORK_GUIDANCE: Record<Framework, string[]> = {
  nextjs: [
    "Use the App Router and server components by default. Add `\"use client\"` only for interactivity or browser APIs.",
    "Keep data fetching in server components or route handlers when practical.",
    "Use `next/image` for images and `next/link` for internal navigation.",
  ],
  "vite-react": [
    "Follow Vite conventions and lazy-import route-level components for code splitting.",
    "Keep component styles and tests close to the features they support.",
  ],
  react: [
    "Prefer composition over inheritance, keep components focused, and lift state only when multiple consumers need it.",
  ],
  express: [
    "Keep Express middleware and handlers thin and delegate business logic to services.",
    "Validate request input at the route boundary and centralize error handling.",
  ],
  fastify: [
    "Use Fastify schemas and plugins to keep validation, serialization, and dependencies explicit.",
    "Keep handlers thin and delegate business logic to services.",
  ],
  hono: [
    "Use Hono middleware and typed bindings consistently across route handlers.",
    "Validate input at the route boundary and keep business logic outside handlers.",
  ],
  koa: [
    "Keep Koa middleware small, ordered deliberately, and explicit about context mutations.",
    "Validate input before invoking service-layer logic.",
  ],
  django: [
    "Follow Django app boundaries, use the ORM deliberately, and keep business logic out of views when practical.",
    "Use migrations for schema changes and validate permissions at request boundaries.",
  ],
  flask: [
    "Use blueprints for modular routing and application factories for configurable startup.",
    "Validate request input and keep business logic outside view functions.",
  ],
  fastapi: [
    "Use Pydantic models for request and response contracts and dependency injection for shared concerns.",
    "Keep route functions thin and make async boundaries explicit.",
  ],
  gin: [
    "Keep Gin handlers thin, validate and bind inputs explicitly, and return consistent error responses.",
    "Pass dependencies explicitly instead of relying on package-level mutable state.",
  ],
  echo: [
    "Use Echo middleware and binding consistently, validate inputs, and centralize HTTP error handling.",
    "Keep transport concerns separate from service logic.",
  ],
  actix: [
    "Use Actix extractors for typed inputs and keep shared state explicit and thread-safe.",
    "Map domain errors to consistent HTTP responses at the boundary.",
  ],
  axum: [
    "Use Axum extractors and state types to make request dependencies explicit.",
    "Keep handlers thin and centralize response and error conversion.",
  ],
  spring: [
    "Keep controllers thin, use constructor injection, and define validation at API boundaries.",
    "Use transactional service boundaries deliberately and cover repository behavior with tests.",
  ],
  rails: [
    "Follow Rails conventions, keep controllers thin, and place domain behavior in focused models or service objects.",
    "Use migrations for schema changes and enforce authorization consistently.",
  ],
  none: ["Follow the repository's established architecture and keep framework-independent boundaries explicit."],
};

export function describeProjectType(manifest: Manifest): string {
  return PROJECT_TYPE_LABELS[manifest.project.type];
}

export function describeLanguage(manifest: Manifest): string {
  return LANGUAGE_LABELS[manifest.project.language];
}

export function sourceGlob(manifest: Manifest): string {
  return LANGUAGE_GLOBS[manifest.project.language];
}

export function buildLanguageGuidance(manifest: Manifest): string[] {
  return LANGUAGE_GUIDANCE[manifest.project.language];
}

export function buildFrameworkGuidance(manifest: Manifest): string[] {
  return FRAMEWORK_GUIDANCE[manifest.project.framework];
}
