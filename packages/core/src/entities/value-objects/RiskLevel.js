// packages/core/src/entities/value-objects/RiskLevel.ts
/**
 * Value Object: Risk Level
 *
 * Encapsulates risk classification with comparison logic,
 * numeric scoring, and display formatting.
 */
const RISK_LEVELS = ["low", "medium", "high", "critical"];
const RISK_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};
const RISK_LABELS = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
  critical: "Crítico",
};
export class RiskLevel {
  value;
  constructor(value) {
    this.value = value;
  }
  static create(value) {
    if (!RISK_LEVELS.includes(value)) {
      throw new Error(
        `Invalid risk level: "${value}". Valid: ${RISK_LEVELS.join(", ")}`,
      );
    }
    return new RiskLevel(value);
  }
  static low() {
    return new RiskLevel("low");
  }
  static medium() {
    return new RiskLevel("medium");
  }
  static high() {
    return new RiskLevel("high");
  }
  static critical() {
    return new RiskLevel("critical");
  }
  get score() {
    return RISK_SCORES[this.value];
  }
  get label() {
    return RISK_LABELS[this.value];
  }
  isHighOrAbove() {
    return this.score >= RISK_SCORES.high;
  }
  isCritical() {
    return this.value === "critical";
  }
  isGreaterThan(other) {
    return this.score > other.score;
  }
  isGreaterOrEqual(other) {
    return this.score >= other.score;
  }
  equals(other) {
    return this.value === other.value;
  }
  toString() {
    return this.value;
  }
}
