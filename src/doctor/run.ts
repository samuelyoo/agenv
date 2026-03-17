import { inspectRepo } from "../detect/repo-inspector.js";
import { loadManifest } from "../manifest/load.js";
import type { Manifest } from "../manifest/schema.js";
import { runCompatibilityChecks } from "./checks/compatibility.js";
import { runEnvChecks } from "./checks/env.js";
import { runManifestChecks } from "./checks/manifest.js";
import { runPathChecks } from "./checks/paths.js";
import { runRepoMatchChecks } from "./checks/repo-match.js";
import { runSecurityChecks } from "./checks/security.js";
import type { DiagnosticFinding, DoctorResult } from "./types.js";

type RunDoctorOptions = {
  strict: boolean;
  targets: string[];
};

function partitionFindings(findings: DiagnosticFinding[]): DoctorResult {
  const errors = findings.filter((finding) => finding.severity === "error");
  const warnings = findings.filter((finding) => finding.severity === "warning");
  const info = findings.filter((finding) => finding.severity === "info");

  return {
    status: errors.length > 0 ? "error" : "ok",
    errors,
    warnings,
    info,
  };
}

export async function runDoctor(
  cwd: string,
  options: RunDoctorOptions,
): Promise<DoctorResult> {
  const inspection = await inspectRepo(cwd);

  let manifest: Manifest | undefined;
  let manifestLoadError: unknown;

  try {
    manifest = (await loadManifest(cwd, { projectName: inspection.projectName })).manifest;
  } catch (error) {
    manifestLoadError = error;
  }

  const findings = [
    ...runManifestChecks(manifest, manifestLoadError),
    ...runCompatibilityChecks(manifest, inspection),
    ...runSecurityChecks(manifest),
    ...runEnvChecks(manifest),
    ...(await runPathChecks(cwd, manifest)),
    ...runRepoMatchChecks(manifest, inspection),
  ];

  const result = partitionFindings(findings);

  if (options.strict && result.warnings.length > 0 && result.status !== "error") {
    return {
      ...result,
      status: "error",
    };
  }

  return result;
}
