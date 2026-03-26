export type DetectedFramework = "react" | "nextjs" | "vite-react" | "express" | "fastify" | "hono" | "koa";

export function detectFrameworkFromDependencies(
  dependencies: Record<string, string>,
): DetectedFramework | undefined {
  // Frontend frameworks take priority — a Next.js app with express shouldn't be detected as express
  if ("next" in dependencies) {
    return "nextjs";
  }

  if ("vite" in dependencies && "react" in dependencies) {
    return "vite-react";
  }

  if ("react" in dependencies) {
    return "react";
  }

  // Backend frameworks — hono/fastify/koa before express (express is sometimes a transitive dep)
  if ("hono" in dependencies) {
    return "hono";
  }

  if ("fastify" in dependencies) {
    return "fastify";
  }

  if ("koa" in dependencies) {
    return "koa";
  }

  if ("express" in dependencies) {
    return "express";
  }

  return undefined;
}
