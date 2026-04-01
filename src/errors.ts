/**
 * Structured error types for agenv.
 *
 * All user-facing errors should extend AgenvError so the CLI
 * can render friendly messages and set correct exit codes.
 */

export class AgenvError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AgenvError";
    this.code = code;
  }
}

export class ManifestNotFoundError extends AgenvError {
  constructor(path: string) {
    super("MANIFEST_NOT_FOUND", `No manifest found at ${path}. Run "agenv init" first.`);
    this.name = "ManifestNotFoundError";
  }
}

export class ManifestValidationError extends AgenvError {
  readonly details: string[];

  constructor(details: string[]) {
    super(
      "MANIFEST_INVALID",
      `Manifest validation failed:\n${details.map((d) => `  - ${d}`).join("\n")}`,
    );
    this.name = "ManifestValidationError";
    this.details = details;
  }
}

export class WriteConflictError extends AgenvError {
  readonly filePath: string;

  constructor(filePath: string) {
    super(
      "WRITE_CONFLICT",
      `File "${filePath}" was modified outside agenv and cannot be safely overwritten. Use --force to overwrite.`,
    );
    this.name = "WriteConflictError";
    this.filePath = filePath;
  }
}

export class InvalidOptionError extends AgenvError {
  readonly option: string;
  readonly allowed: readonly string[];

  constructor(option: string, value: string, allowed: readonly string[]) {
    super(
      "INVALID_OPTION",
      `Invalid value "${value}" for ${option}. Allowed: ${allowed.join(", ")}.`,
    );
    this.name = "InvalidOptionError";
    this.option = option;
    this.allowed = allowed;
  }
}

export class BackupError extends AgenvError {
  constructor(filePath: string, reason: string) {
    super("BACKUP_FAILED", `Failed to create backup of "${filePath}": ${reason}`);
    this.name = "BackupError";
  }
}

export class PackNotFoundError extends AgenvError {
  constructor(id: string) {
    super("PACK_NOT_FOUND", `Pack "${id}" not found. Use "agenv add pack --list" to see available packs.`);
    this.name = "PackNotFoundError";
  }
}

export class PackValidationError extends AgenvError {
  readonly details: string[];

  constructor(packDir: string, details: string[]) {
    super(
      "PACK_INVALID",
      `Pack at "${packDir}" is invalid:\n${details.map((d) => `  - ${d}`).join("\n")}`,
    );
    this.name = "PackValidationError";
    this.details = details;
  }
}

export class LockfileError extends AgenvError {
  constructor(message: string) {
    super("LOCKFILE_ERROR", message);
    this.name = "LockfileError";
  }
}

export class AuditError extends AgenvError {
  constructor(message: string) {
    super("AUDIT_ERROR", message);
    this.name = "AuditError";
  }
}

export class SourceResolutionError extends AgenvError {
  constructor(message: string) {
    super("SOURCE_RESOLUTION_FAILED", message);
    this.name = "SourceResolutionError";
  }
}

export class PublishError extends AgenvError {
  constructor(message: string) {
    super("PUBLISH_FAILED", message);
    this.name = "PublishError";
  }
}

export class CompatibilityWarning extends AgenvError {
  readonly details: string[];

  constructor(details: string[]) {
    super(
      "COMPATIBILITY_WARNING",
      `Compatibility issues:\n${details.map((d) => `  - ${d}`).join("\n")}`,
    );
    this.name = "CompatibilityWarning";
    this.details = details;
  }
}

export function isAgenvError(error: unknown): error is AgenvError {
  return error instanceof AgenvError;
}
