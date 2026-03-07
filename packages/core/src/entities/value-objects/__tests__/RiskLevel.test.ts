// packages/core/src/entities/value-objects/__tests__/RiskLevel.test.ts

import { describe, it, expect } from "vitest";
import { RiskLevel } from "../RiskLevel";

describe("RiskLevel", () => {
  // ─── Factory ──────────────────────────────────────────

  describe("create", () => {
    it("should create from valid string", () => {
      const risk = RiskLevel.create("high");
      expect(risk.value).toBe("high");
    });

    it("should throw for invalid value", () => {
      expect(() => RiskLevel.create("extreme")).toThrow("Invalid risk level");
    });

    it("should create via static factory methods", () => {
      expect(RiskLevel.low().value).toBe("low");
      expect(RiskLevel.medium().value).toBe("medium");
      expect(RiskLevel.high().value).toBe("high");
      expect(RiskLevel.critical().value).toBe("critical");
    });
  });

  // ─── Scoring ──────────────────────────────────────────

  describe("score", () => {
    it("should return correct numeric scores", () => {
      expect(RiskLevel.low().score).toBe(1);
      expect(RiskLevel.medium().score).toBe(2);
      expect(RiskLevel.high().score).toBe(3);
      expect(RiskLevel.critical().score).toBe(4);
    });
  });

  // ─── Labels ───────────────────────────────────────────

  describe("label", () => {
    it("should return Portuguese labels", () => {
      expect(RiskLevel.low().label).toBe("Baixo");
      expect(RiskLevel.critical().label).toBe("Crítico");
    });
  });

  // ─── Comparison ───────────────────────────────────────

  describe("comparison", () => {
    it("isHighOrAbove should detect high and critical", () => {
      expect(RiskLevel.low().isHighOrAbove()).toBe(false);
      expect(RiskLevel.medium().isHighOrAbove()).toBe(false);
      expect(RiskLevel.high().isHighOrAbove()).toBe(true);
      expect(RiskLevel.critical().isHighOrAbove()).toBe(true);
    });

    it("isCritical should only match critical", () => {
      expect(RiskLevel.high().isCritical()).toBe(false);
      expect(RiskLevel.critical().isCritical()).toBe(true);
    });

    it("isGreaterThan should compare scores", () => {
      expect(RiskLevel.high().isGreaterThan(RiskLevel.low())).toBe(true);
      expect(RiskLevel.low().isGreaterThan(RiskLevel.high())).toBe(false);
    });

    it("equals should match same levels", () => {
      expect(RiskLevel.high().equals(RiskLevel.high())).toBe(true);
      expect(RiskLevel.high().equals(RiskLevel.low())).toBe(false);
    });
  });

  // ─── Serialization ────────────────────────────────────

  describe("toString", () => {
    it("should return the raw value", () => {
      expect(RiskLevel.critical().toString()).toBe("critical");
    });
  });
});
