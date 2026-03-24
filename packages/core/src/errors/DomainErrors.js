// packages/core/src/errors/DomainErrors.ts
export class DomainError extends Error {
  code;
  severity;
  constructor(message, code, severity = "medium") {
    super(message);
    this.code = code;
    this.severity = severity;
    this.name = "DomainError";
  }
  isCritical() {
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
  httpStatus;
  constructor(message, code, httpStatus = 500, severity = "high") {
    super(message, code, severity);
    this.httpStatus = httpStatus;
    this.name = "AppError";
  }
  static notFound(entity, id) {
    return new AppError(
      `${entity} "${id}" not found`,
      "NOT_FOUND",
      404,
      "medium",
    );
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, "UNAUTHORIZED", 401, "high");
  }
  static forbidden(message = "Forbidden") {
    return new AppError(message, "FORBIDDEN", 403, "high");
  }
  static badRequest(message) {
    return new AppError(message, "BAD_REQUEST", 400, "low");
  }
}
