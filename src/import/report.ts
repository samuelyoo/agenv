import { formatJson } from "../utils/json.js";
import type { ImportReport } from "./index.js";

export function formatImportReport(report: ImportReport): string {
  const { findings, warnings, unsupported } = report;

  if (findings.length === 0 && warnings.length === 0 && unsupported.length === 0) {
    return "No import candidates found.\n";
  }

  const lines: string[] = [];

  if (findings.length > 0) {
    lines.push("Findings:");
    for (const f of findings) {
      lines.push(
        `  [${f.source}] ${f.field} = ${formatJson(f.value).trim()} (${f.confidence})${f.note ? ` — ${f.note}` : ""}`,
      );
    }
  }

  if (warnings.length > 0) {
    lines.push("");
    lines.push("Warnings:");
    for (const w of warnings) {
      lines.push(`  ${w}`);
    }
  }

  if (unsupported.length > 0) {
    lines.push("");
    lines.push("Unsupported:");
    for (const u of unsupported) {
      lines.push(`  [${u.source}] ${u.path} — ${u.reason}`);
    }
  }

  return `${lines.join("\n")}\n`;
}
