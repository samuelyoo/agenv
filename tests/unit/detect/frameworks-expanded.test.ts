import { describe, expect, it } from "vitest";
import {
  detectFrameworkFromDependencies,
  detectNonJsFramework,
} from "../../../src/detect/frameworks.js";

describe("non-JS framework detection", () => {
  it("detects django from python deps", () => {
    expect(detectNonJsFramework({ django: ">=4.0" }, "python")).toBe("django");
  });

  it("detects flask from python deps", () => {
    expect(detectNonJsFramework({ flask: ">=3.0" }, "python")).toBe("flask");
  });

  it("detects fastapi from python deps", () => {
    expect(detectNonJsFramework({ fastapi: ">=0.100" }, "python")).toBe("fastapi");
  });

  it("detects gin from go deps", () => {
    expect(detectNonJsFramework({ "github.com/gin-gonic/gin": "v1.9.0" }, "go")).toBe("gin");
  });

  it("detects echo from go deps", () => {
    expect(detectNonJsFramework({ "github.com/labstack/echo/v4": "v4.11.0" }, "go")).toBe("echo");
  });

  it("detects spring from java deps", () => {
    expect(detectNonJsFramework({ "org.springframework.boot": "3.2.0" }, "java")).toBe("spring");
  });

  it("detects rails from ruby deps", () => {
    expect(detectNonJsFramework({ rails: "~> 7.0" }, "ruby")).toBe("rails");
  });

  it("returns undefined for unknown deps", () => {
    expect(detectNonJsFramework({ lodash: "^4.0.0" }, "python")).toBeUndefined();
  });

  it("preserves existing JS/TS framework detection", () => {
    expect(detectFrameworkFromDependencies({ next: "^14.0.0" })).toBe("nextjs");
    expect(detectFrameworkFromDependencies({ express: "^4.18.0" })).toBe("express");
  });
});
