import { formatJson } from "./json.js";

export function parseCommaList(value?: string): string[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function formatTextBlock(lines: string[]): string {
  return `${lines.join("\n")}\n`;
}

export function formatCommandOutput(
  text: string,
  jsonValue: unknown,
  asJson: boolean,
): string {
  if (asJson) {
    return formatJson(jsonValue);
  }

  return text.endsWith("\n") ? text : `${text}\n`;
}
