import { describe, expect, it } from "vitest";
import {
  AgenvError,
  BackupError,
  InvalidOptionError,
  ManifestNotFoundError,
  ManifestValidationError,
  WriteConflictError,
  isAgenvError,
} from "../../src/errors.js";

describe("AgenvError", () => {
  it("stores code and message", () => {
    const error = new AgenvError("TEST_CODE", "something broke");

    expect(error.code).toBe("TEST_CODE");
    expect(error.message).toBe("something broke");
    expect(error.name).toBe("AgenvError");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("ManifestNotFoundError", () => {
  it("includes the path and a hint to run init", () => {
    const error = new ManifestNotFoundError("/foo/ai-workspace.json");

    expect(error.code).toBe("MANIFEST_NOT_FOUND");
    expect(error.message).toContain("/foo/ai-workspace.json");
    expect(error.message).toContain("agenv init");
    expect(error.name).toBe("ManifestNotFoundError");
  });
});

describe("ManifestValidationError", () => {
  it("formats multiple detail lines", () => {
    const error = new ManifestValidationError(["bad field A", "bad field B"]);

    expect(error.code).toBe("MANIFEST_INVALID");
    expect(error.details).toEqual(["bad field A", "bad field B"]);
    expect(error.message).toContain("- bad field A");
    expect(error.message).toContain("- bad field B");
    expect(error.name).toBe("ManifestValidationError");
  });
});

describe("WriteConflictError", () => {
  it("includes the file path and --force hint", () => {
    const error = new WriteConflictError("AGENTS.md");

    expect(error.code).toBe("WRITE_CONFLICT");
    expect(error.filePath).toBe("AGENTS.md");
    expect(error.message).toContain("AGENTS.md");
    expect(error.message).toContain("--force");
    expect(error.name).toBe("WriteConflictError");
  });
});

describe("InvalidOptionError", () => {
  it("lists allowed values", () => {
    const error = new InvalidOptionError("--framework", "angular", ["react", "nextjs", "vite-react"]);

    expect(error.code).toBe("INVALID_OPTION");
    expect(error.option).toBe("--framework");
    expect(error.allowed).toEqual(["react", "nextjs", "vite-react"]);
    expect(error.message).toContain("angular");
    expect(error.message).toContain("react, nextjs, vite-react");
    expect(error.name).toBe("InvalidOptionError");
  });
});

describe("BackupError", () => {
  it("includes the file path and reason", () => {
    const error = new BackupError("some/file.md", "permission denied");

    expect(error.code).toBe("BACKUP_FAILED");
    expect(error.message).toContain("some/file.md");
    expect(error.message).toContain("permission denied");
    expect(error.name).toBe("BackupError");
  });
});

describe("isAgenvError", () => {
  it("returns true for AgenvError instances", () => {
    expect(isAgenvError(new AgenvError("X", "x"))).toBe(true);
    expect(isAgenvError(new ManifestNotFoundError("/x"))).toBe(true);
    expect(isAgenvError(new InvalidOptionError("--x", "y", ["a"]))).toBe(true);
  });

  it("returns false for non-AgenvError values", () => {
    expect(isAgenvError(new Error("plain"))).toBe(false);
    expect(isAgenvError("string")).toBe(false);
    expect(isAgenvError(null)).toBe(false);
    expect(isAgenvError(undefined)).toBe(false);
  });
});
