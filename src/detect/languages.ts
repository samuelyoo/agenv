import { access } from "node:fs/promises";
import { join } from "node:path";
import type { Language } from "../manifest/schema.js";

type LanguageMarker = {
  file: string;
  language: Language;
};

const MARKERS: LanguageMarker[] = [
  { file: "tsconfig.json", language: "ts" },
  { file: "pyproject.toml", language: "python" },
  { file: "requirements.txt", language: "python" },
  { file: "setup.py", language: "python" },
  { file: "go.mod", language: "go" },
  { file: "Cargo.toml", language: "rust" },
  { file: "pom.xml", language: "java" },
  { file: "build.gradle", language: "java" },
  { file: "Gemfile", language: "ruby" },
];

export async function detectLanguage(cwd: string): Promise<Language> {
  for (const marker of MARKERS) {
    try {
      await access(join(cwd, marker.file));
      return marker.language;
    } catch {
      // Not found, keep looking.
    }
  }

  return "other";
}
