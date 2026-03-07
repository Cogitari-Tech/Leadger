// packages/core/src/entities/__tests__/AuditProgram.test.ts

import { describe, it, expect } from "vitest";
import { AuditProgram } from "../AuditProgram";
import { DomainError } from "../../errors/DomainErrors";

const validInput = () => ({
  tenantId: "tenant-1",
  name: "Annual IT Audit 2026",
  description: "Comprehensive IT audit",
  frequency: "annual" as const,
  createdBy: "user-1",
});

describe("AuditProgram", () => {
  // ─── Factory ──────────────────────────────────────────

  describe("create", () => {
    it("should create a draft program with valid input", () => {
      const program = AuditProgram.create(validInput());

      expect(program.name).toBe("Annual IT Audit 2026");
      expect(program.status).toBe("draft");
      expect(program.tenantId).toBe("tenant-1");
      expect(program.frequency).toBe("annual");
      expect(program.id).toBeTruthy();
    });

    it("should throw when name is empty", () => {
      expect(() => AuditProgram.create({ ...validInput(), name: "" })).toThrow(
        DomainError,
      );
    });

    it("should throw when start > end date", () => {
      expect(() =>
        AuditProgram.create({
          ...validInput(),
          startDate: new Date("2026-12-01"),
          endDate: new Date("2026-01-01"),
        }),
      ).toThrow("Start date cannot be after end date");
    });

    it("should allow null dates", () => {
      const program = AuditProgram.create(validInput());
      expect(program.startDate).toBeNull();
      expect(program.endDate).toBeNull();
    });
  });

  // ─── State Machine ────────────────────────────────────

  describe("transitionTo", () => {
    it("should transition draft → in_progress", () => {
      const program = AuditProgram.create(validInput());
      program.transitionTo("in_progress");
      expect(program.status).toBe("in_progress");
    });

    it("should transition draft → cancelled", () => {
      const program = AuditProgram.create(validInput());
      program.transitionTo("cancelled");
      expect(program.status).toBe("cancelled");
    });

    it("should transition in_progress → under_review", () => {
      const program = AuditProgram.create(validInput());
      program.transitionTo("in_progress");
      program.transitionTo("under_review");
      expect(program.status).toBe("under_review");
    });

    it("should transition under_review → approved", () => {
      const program = AuditProgram.create(validInput());
      program.transitionTo("in_progress");
      program.transitionTo("under_review");
      program.transitionTo("approved");
      expect(program.status).toBe("approved");
    });

    it("should transition under_review → in_progress (reject)", () => {
      const program = AuditProgram.create(validInput());
      program.transitionTo("in_progress");
      program.transitionTo("under_review");
      program.transitionTo("in_progress");
      expect(program.status).toBe("in_progress");
    });

    it("should throw on invalid transition draft → approved", () => {
      const program = AuditProgram.create(validInput());
      expect(() => program.transitionTo("approved")).toThrow(
        "Cannot transition",
      );
    });

    it("should throw on transition from terminal state", () => {
      const program = AuditProgram.create(validInput());
      program.transitionTo("cancelled");
      expect(() => program.transitionTo("draft")).toThrow("Cannot transition");
    });
  });

  // ─── Behavior ─────────────────────────────────────────

  describe("updateDetails", () => {
    it("should update name while in draft", () => {
      const program = AuditProgram.create(validInput());
      program.updateDetails({ name: "Updated Name" });
      expect(program.name).toBe("Updated Name");
    });

    it("should throw when updating locked program", () => {
      const program = AuditProgram.create(validInput());
      program.transitionTo("in_progress");
      program.transitionTo("under_review");
      expect(() => program.updateDetails({ name: "New Name" })).toThrow(
        "Cannot modify",
      );
    });
  });

  describe("assignResponsible", () => {
    it("should set responsible user", () => {
      const program = AuditProgram.create(validInput());
      program.assignResponsible("user-42");
      expect(program.responsibleId).toBe("user-42");
    });
  });

  // ─── Query Methods ────────────────────────────────────

  describe("query methods", () => {
    it("isDraft should return true for new program", () => {
      const program = AuditProgram.create(validInput());
      expect(program.isDraft()).toBe(true);
      expect(program.isActive()).toBe(false);
    });

    it("isTerminal should detect completed/archived/cancelled", () => {
      const program = AuditProgram.create(validInput());
      program.transitionTo("cancelled");
      expect(program.isTerminal()).toBe(true);
    });

    it("canBeEdited should be true for draft and in_progress", () => {
      const program = AuditProgram.create(validInput());
      expect(program.canBeEdited()).toBe(true);
      program.transitionTo("in_progress");
      expect(program.canBeEdited()).toBe(true);
    });
  });

  // ─── Persistence ──────────────────────────────────────

  describe("toPersistence / fromPersistence", () => {
    it("should round-trip through persistence", () => {
      const original = AuditProgram.create({
        ...validInput(),
        startDate: new Date("2026-01-15"),
        endDate: new Date("2026-06-30"),
      });

      const persisted = original.toPersistence();
      const restored = AuditProgram.fromPersistence(persisted);

      expect(restored.name).toBe(original.name);
      expect(restored.status).toBe(original.status);
      expect(restored.frequency).toBe(original.frequency);
      expect(restored.tenantId).toBe(original.tenantId);
    });
  });
});
