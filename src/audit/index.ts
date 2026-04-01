import type { DiagnosticFinding } from "../doctor/types.js";
import { readLockfile } from "../install/lockfile.js";
import { loadManifest } from "../manifest/load.js";
import type { Manifest } from "../manifest/schema.js";
import { checkOwnership, type OwnershipReport } from "./ownership.js";
import {
  checkDangerousPatterns,
  checkLockfileFreshness,
  checkMcpTrustLevels,
  checkMissingEnvVars,
} from "./rules.js";

export type AuditResult = {
  status: "pass" | "fail";
  findings: DiagnosticFinding[];
  ownership: OwnershipReport;
};

export async function runAudit(cwd: string): Promise<AuditResult> {
  let manifest: Manifest | undefined;

  try {
    manifest = (await loadManifest(cwd)).manifest;
  } catch {
    // Manifest not found or invalid — report as error-level finding
    const findings: DiagnosticFinding[] = [
      {
        severity: "error",
        code: "manifest_missing",
        message: "No valid manifest found. Run `agenv init` to create one.",
      },
    ];
    return {
      status: "fail",
      findings,
      ownership: { entries: [], findings: [] },
    };
  }

  const lockfile = await readLockfile(cwd);

  const findings: DiagnosticFinding[] = [
    ...checkMcpTrustLevels(manifest),
    ...checkMissingEnvVars(manifest),
    ...checkDangerousPatterns(manifest),
    ...checkLockfileFreshness(manifest, lockfile),
  ];

  const ownership = await checkOwnership(cwd, manifest);
  findings.push(...ownership.findings);

  const hasErrors = findings.some((f) => f.severity === "error");

  return {
    status: hasErrors ? "fail" : "pass",
    findings,
    ownership,
  };
}
