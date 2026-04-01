import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectLanguage } from "../../../src/detect/languages.js";

const tempDirs: string[] = [];

async function makeTempDir() {
  const cwd = await mkdtemp(join(tmpdir(), "agenv-lang-"));
  tempDirs.push(cwd);
  return cwd;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
});

describe("detectLanguage", () => {
  it("detects TypeScript from tsconfig.json", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "tsconfig.json"), "{}");
    expect(await detectLanguage(cwd)).toBe("ts");
  });

  it("detects Python from pyproject.toml", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "pyproject.toml"), "[project]");
    expect(await detectLanguage(cwd)).toBe("python");
  });

  it("detects Python from requirements.txt", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "requirements.txt"), "flask==3.0.0");
    expect(await detectLanguage(cwd)).toBe("python");
  });

  it("detects Python from setup.py", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "setup.py"), "from setuptools import setup");
    expect(await detectLanguage(cwd)).toBe("python");
  });

  it("detects Go from go.mod", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "go.mod"), "module example.com/m");
    expect(await detectLanguage(cwd)).toBe("go");
  });

  it("detects Rust from Cargo.toml", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "Cargo.toml"), "[package]");
    expect(await detectLanguage(cwd)).toBe("rust");
  });

  it("detects Java from pom.xml", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "pom.xml"), "<project></project>");
    expect(await detectLanguage(cwd)).toBe("java");
  });

  it("detects Java from build.gradle", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "build.gradle"), "apply plugin: 'java'");
    expect(await detectLanguage(cwd)).toBe("java");
  });

  it("detects Ruby from Gemfile", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "Gemfile"), 'source "https://rubygems.org"');
    expect(await detectLanguage(cwd)).toBe("ruby");
  });

  it("falls back to other when no markers found", async () => {
    const cwd = await makeTempDir();
    expect(await detectLanguage(cwd)).toBe("other");
  });

  it("prefers TypeScript when tsconfig.json coexists with other markers", async () => {
    const cwd = await makeTempDir();
    await writeFile(join(cwd, "tsconfig.json"), "{}");
    await writeFile(join(cwd, "requirements.txt"), "flask==3.0.0");
    expect(await detectLanguage(cwd)).toBe("ts");
  });
});
