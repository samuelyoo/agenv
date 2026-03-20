import { describe, expect, it } from "vitest";
import {
  GENERATED_NOTICE,
  applyGeneratedHeader,
  canHaveGeneratedHeader,
  hasGeneratedHeader,
  withLineCommentHeader,
  withMarkdownGeneratedHeader,
} from "../../../src/fs/headers.js";

describe("withMarkdownGeneratedHeader", () => {
  it("wraps content in an HTML comment", () => {
    const result = withMarkdownGeneratedHeader("# Title");
    expect(result).toBe(`<!-- ${GENERATED_NOTICE} -->\n\n# Title`);
  });
});

describe("withLineCommentHeader", () => {
  it("prepends a hash-prefixed comment", () => {
    const result = withLineCommentHeader("KEY=value");
    expect(result).toBe(`# ${GENERATED_NOTICE}\n\nKEY=value`);
  });
});

describe("canHaveGeneratedHeader", () => {
  it("returns true for markdown, txt, env, and example files", () => {
    expect(canHaveGeneratedHeader("README.md")).toBe(true);
    expect(canHaveGeneratedHeader("notes.txt")).toBe(true);
    expect(canHaveGeneratedHeader(".env")).toBe(true);
    expect(canHaveGeneratedHeader("config.example")).toBe(true);
  });

  it("returns false for json, ts, and other files", () => {
    expect(canHaveGeneratedHeader("config.json")).toBe(false);
    expect(canHaveGeneratedHeader("index.ts")).toBe(false);
    expect(canHaveGeneratedHeader("style.css")).toBe(false);
  });
});

describe("applyGeneratedHeader", () => {
  it("applies markdown header for .md files", () => {
    expect(applyGeneratedHeader("file.md", "body")).toBe(
      `<!-- ${GENERATED_NOTICE} -->\n\nbody`,
    );
  });

  it("applies line comment header for .env files", () => {
    expect(applyGeneratedHeader(".env", "KEY=val")).toBe(
      `# ${GENERATED_NOTICE}\n\nKEY=val`,
    );
  });

  it("applies line comment header for .example files", () => {
    expect(applyGeneratedHeader("config.example", "body")).toBe(
      `# ${GENERATED_NOTICE}\n\nbody`,
    );
  });

  it("returns content unchanged for unsupported extensions", () => {
    expect(applyGeneratedHeader("data.json", '{"a":1}')).toBe('{"a":1}');
  });
});

describe("hasGeneratedHeader", () => {
  it("detects markdown generated header", () => {
    expect(hasGeneratedHeader("file.md", `<!-- ${GENERATED_NOTICE} -->\n\nbody`)).toBe(true);
  });

  it("detects line comment generated header", () => {
    expect(hasGeneratedHeader(".env", `# ${GENERATED_NOTICE}\n\nKEY=val`)).toBe(true);
    expect(hasGeneratedHeader("config.example", `# ${GENERATED_NOTICE}\n\nbody`)).toBe(true);
  });

  it("returns false when header is missing", () => {
    expect(hasGeneratedHeader("file.md", "# Manual content")).toBe(false);
    expect(hasGeneratedHeader(".env", "KEY=val")).toBe(false);
  });

  it("returns false for unsupported extensions", () => {
    expect(hasGeneratedHeader("data.json", `<!-- ${GENERATED_NOTICE} -->`)).toBe(false);
  });
});
