export type DetectedFramework = "react" | "nextjs" | "vite-react" | "express" | "fastify" | "hono" | "koa" | "django" | "flask" | "fastapi" | "gin" | "echo" | "actix" | "axum" | "spring" | "rails" | "none";

export function detectNonJsFramework(
  deps: Record<string, string>,
  language: string,
): DetectedFramework | undefined {
  if (language === "python") {
    if ("django" in deps) return "django";
    if ("flask" in deps) return "flask";
    if ("fastapi" in deps) return "fastapi";
  }

  if (language === "go") {
    for (const key of Object.keys(deps)) {
      if (key.includes("gin-gonic/gin")) return "gin";
      if (key.includes("labstack/echo")) return "echo";
    }
  }

  if (language === "rust") {
    if ("actix-web" in deps) return "actix";
    if ("axum" in deps) return "axum";
  }

  if (language === "java") {
    for (const key of Object.keys(deps)) {
      if (key.includes("springframework")) return "spring";
    }
  }

  if (language === "ruby") {
    if ("rails" in deps) return "rails";
  }

  return undefined;
}

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
