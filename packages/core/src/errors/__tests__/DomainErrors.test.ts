// packages/core/src/errors/__tests__/DomainErrors.test.ts

import { describe, it, expect } from "vitest";
import { DomainError, AppError } from "../DomainErrors";

describe("DomainError", () => {
  it("should create with message, code, and default severity", () => {
    const err = new DomainError("Something failed", "GENERIC_FAIL");
    expect(err.message).toBe("Something failed");
    expect(err.code).toBe("GENERIC_FAIL");
    expect(err.severity).toBe("medium");
    expect(err.name).toBe("DomainError");
  });

  it("should support custom severity", () => {
    const err = new DomainError("Critical!", "CRITICAL", "critical");
    expect(err.severity).toBe("critical");
    expect(err.isCritical()).toBe(true);
  });

  it("isCritical should be false for non-critical", () => {
    const err = new DomainError("Low", "LOW", "low");
    expect(err.isCritical()).toBe(false);
  });

  it("toJSON should serialize all fields", () => {
    const err = new DomainError("msg", "CODE", "high");
    const json = err.toJSON();
    expect(json).toEqual({
      name: "DomainError",
      code: "CODE",
      message: "msg",
      severity: "high",
    });
  });
});

describe("AppError", () => {
  it("should include HTTP status", () => {
    const err = new AppError("Not found", "NOT_FOUND", 404);
    expect(err.httpStatus).toBe(404);
    expect(err.name).toBe("AppError");
  });

  describe("static factories", () => {
    it("notFound should return 404", () => {
      const err = AppError.notFound("Program", "abc");
      expect(err.httpStatus).toBe(404);
      expect(err.message).toContain("abc");
      expect(err.code).toBe("NOT_FOUND");
    });

    it("unauthorized should return 401", () => {
      const err = AppError.unauthorized();
      expect(err.httpStatus).toBe(401);
      expect(err.severity).toBe("high");
    });

    it("forbidden should return 403", () => {
      const err = AppError.forbidden("No access");
      expect(err.httpStatus).toBe(403);
      expect(err.message).toBe("No access");
    });

    it("badRequest should return 400", () => {
      const err = AppError.badRequest("Invalid input");
      expect(err.httpStatus).toBe(400);
      expect(err.severity).toBe("low");
    });
  });

  it("should be instanceof DomainError", () => {
    const err = AppError.notFound("X", "1");
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(AppError);
  });
});
