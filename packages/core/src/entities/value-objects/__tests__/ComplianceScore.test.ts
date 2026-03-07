// packages/core/src/entities/value-objects/__tests__/ComplianceScore.test.ts

import { describe, it, expect } from "vitest";
import { ComplianceScore } from "../ComplianceScore";

describe("ComplianceScore", () => {
  // ─── Factory ──────────────────────────────────────────

  describe("create", () => {
    it("should calculate percentage correctly", () => {
      const score = ComplianceScore.create(8, 10);
      expect(score.percentage).toBe(80);
      expect(score.resolved).toBe(8);
      expect(score.total).toBe(10);
    });

    it("should return 100% when total is 0", () => {
      const score = ComplianceScore.create(0, 0);
      expect(score.percentage).toBe(100);
    });

    it("should throw for negative values", () => {
      expect(() => ComplianceScore.create(-1, 10)).toThrow("non-negative");
    });

    it("should throw when resolved exceeds total", () => {
      expect(() => ComplianceScore.create(11, 10)).toThrow(
        "Resolved cannot exceed total",
      );
    });

    it("perfect() should return 100%", () => {
      const score = ComplianceScore.perfect();
      expect(score.percentage).toBe(100);
    });
  });

  // ─── Grading ──────────────────────────────────────────

  describe("grade", () => {
    it("should grade A for 90%+", () => {
      expect(ComplianceScore.create(9, 10).grade).toBe("A");
      expect(ComplianceScore.create(10, 10).grade).toBe("A");
    });

    it("should grade B for 75-89%", () => {
      expect(ComplianceScore.create(8, 10).grade).toBe("B");
    });

    it("should grade C for 60-74%", () => {
      expect(ComplianceScore.create(6, 10).grade).toBe("C");
    });

    it("should grade D for 40-59%", () => {
      expect(ComplianceScore.create(4, 10).grade).toBe("D");
    });

    it("should grade F for <40%", () => {
      expect(ComplianceScore.create(3, 10).grade).toBe("F");
    });
  });

  // ─── Thresholds ───────────────────────────────────────

  describe("thresholds", () => {
    it("isAcceptable should be true for 60%+", () => {
      expect(ComplianceScore.create(6, 10).isAcceptable).toBe(true);
      expect(ComplianceScore.create(5, 10).isAcceptable).toBe(false);
    });

    it("isExcellent should be true for 90%+", () => {
      expect(ComplianceScore.create(9, 10).isExcellent).toBe(true);
      expect(ComplianceScore.create(8, 10).isExcellent).toBe(false);
    });
  });

  // ─── Computed ─────────────────────────────────────────

  describe("computed", () => {
    it("pending should return total - resolved", () => {
      expect(ComplianceScore.create(7, 10).pending).toBe(3);
    });

    it("format should return percentage with grade", () => {
      expect(ComplianceScore.create(9, 10).format()).toBe("90% (A)");
    });
  });

  // ─── Comparison ───────────────────────────────────────

  describe("comparison", () => {
    it("isGreaterThan should compare percentages", () => {
      const a = ComplianceScore.create(9, 10);
      const b = ComplianceScore.create(5, 10);
      expect(a.isGreaterThan(b)).toBe(true);
      expect(b.isGreaterThan(a)).toBe(false);
    });

    it("equals should match same percentages", () => {
      const a = ComplianceScore.create(5, 10);
      const b = ComplianceScore.create(50, 100);
      expect(a.equals(b)).toBe(true);
    });
  });
});
