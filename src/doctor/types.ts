export type DiagnosticFinding = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  remediation?: string;
  autofixable?: boolean;
};

export type DoctorResult = {
  status: "ok" | "error";
  errors: DiagnosticFinding[];
  warnings: DiagnosticFinding[];
  info: DiagnosticFinding[];
};
