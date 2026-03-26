import { describe, expect, it } from "vitest";
import { detectFrameworkFromDependencies } from "../../../src/detect/frameworks.js";

describe("detectFrameworkFromDependencies", () => {
  // Frontend
  it("detects nextjs", () => {
    expect(detectFrameworkFromDependencies({ next: "^14.0.0" })).toBe("nextjs");
  });

  it("detects vite-react", () => {
    expect(detectFrameworkFromDependencies({ vite: "^5.0.0", react: "^18.0.0" })).toBe("vite-react");
  });

  it("detects react standalone", () => {
    expect(detectFrameworkFromDependencies({ react: "^18.0.0" })).toBe("react");
  });

  // Backend
  it("detects express", () => {
    expect(detectFrameworkFromDependencies({ express: "^4.18.0" })).toBe("express");
  });

  it("detects fastify", () => {
    expect(detectFrameworkFromDependencies({ fastify: "^4.0.0" })).toBe("fastify");
  });

  it("detects hono", () => {
    expect(detectFrameworkFromDependencies({ hono: "^4.0.0" })).toBe("hono");
  });

  it("detects koa", () => {
    expect(detectFrameworkFromDependencies({ koa: "^2.15.0" })).toBe("koa");
  });

  // Priority: frontend wins over backend
  it("prefers nextjs over express when both present", () => {
    expect(detectFrameworkFromDependencies({ next: "^14.0.0", express: "^4.18.0" })).toBe("nextjs");
  });

  it("prefers react over express when both present", () => {
    expect(detectFrameworkFromDependencies({ react: "^18.0.0", express: "^4.18.0" })).toBe("react");
  });

  // Priority: hono/fastify/koa before express
  it("prefers hono over express", () => {
    expect(detectFrameworkFromDependencies({ hono: "^4.0.0", express: "^4.18.0" })).toBe("hono");
  });

  it("prefers fastify over express", () => {
    expect(detectFrameworkFromDependencies({ fastify: "^4.0.0", express: "^4.18.0" })).toBe("fastify");
  });

  // Edge cases
  it("returns undefined for empty deps", () => {
    expect(detectFrameworkFromDependencies({})).toBeUndefined();
  });

  it("returns undefined for unknown deps only", () => {
    expect(detectFrameworkFromDependencies({ lodash: "^4.0.0", chalk: "^5.0.0" })).toBeUndefined();
  });
});
