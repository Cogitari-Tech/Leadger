// packages/core/src/errors/DomainErrors.ts

/**
 * Enhanced Domain Error with severity classification.
 */
export type ErrorSeverity = "critical" | "high" | "medium" | "low" | "info";

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly severity: ErrorSeverity = "medium",
  ) {
    super(message);
    this.name = "DomainError";
  }

  isCritical(): boolean {
    return this.severity === "critical";
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
    };
  }
}

/**
 * Application-level error for infrastructure / integration failures.
 */
export class AppError extends DomainError {
  constructor(
    message: string,
    code: string,
    public readonly httpStatus: number = 500,
    severity: ErrorSeverity = "high",
  ) {
    super(message, code, severity);
    this.name = "AppError";
  }

  static notFound(entity: string, id: string): AppError {
    return new AppError(
      `${entity} "${id}" not found`,
      "NOT_FOUND",
      404,
      "medium",
    );
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(message, "UNAUTHORIZED", 401, "high");
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(message, "FORBIDDEN", 403, "high");
  }

  static badRequest(message: string): AppError {
    return new AppError(message, "BAD_REQUEST", 400, "low");
  }
}
