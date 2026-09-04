import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

async function readDependencyFiles(cwd: string, fileNames: string[]): Promise<string> {
  const contents = await Promise.all(
    fileNames.map(async (fileName) => {
      try {
        return await readFile(join(cwd, fileName), "utf8");
      } catch {
        return "";
      }
    }),
  );

  return contents.join("\n").toLowerCase();
}

export async function detectFrameworkFromRepo(
  cwd: string,
  dependencies: Record<string, string>,
  language: string,
): Promise<DetectedFramework | undefined> {
  const javascriptFramework = detectFrameworkFromDependencies(dependencies);
  if (javascriptFramework) {
    return javascriptFramework;
  }

  if (language === "python") {
    const content = await readDependencyFiles(cwd, [
      "pyproject.toml",
      "requirements.txt",
      "setup.py",
      "Pipfile",
    ]);
    if (/\bdjango\b/.test(content)) return "django";
    if (/\bfastapi\b/.test(content)) return "fastapi";
    if (/\bflask\b/.test(content)) return "flask";
  }

  if (language === "go") {
    const content = await readDependencyFiles(cwd, ["go.mod"]);
    if (content.includes("github.com/gin-gonic/gin")) return "gin";
    if (content.includes("github.com/labstack/echo")) return "echo";
  }

  if (language === "rust") {
    const content = await readDependencyFiles(cwd, ["Cargo.toml"]);
    if (/\bactix-web\b/.test(content)) return "actix";
    if (/\baxum\b/.test(content)) return "axum";
  }

  if (language === "java") {
    const content = await readDependencyFiles(cwd, [
      "pom.xml",
      "build.gradle",
      "build.gradle.kts",
    ]);
    if (content.includes("springframework") || content.includes("spring-boot")) {
      return "spring";
    }
  }

  if (language === "ruby") {
    const content = await readDependencyFiles(cwd, ["Gemfile"]);
    if (/gem\s+["']rails["']/.test(content)) return "rails";
  }

  return undefined;
}
