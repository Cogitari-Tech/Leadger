// packages/core/src/entities/value-objects/RiskLevel.ts

/**
 * Value Object: Risk Level
 *
 * Encapsulates risk classification with comparison logic,
 * numeric scoring, and display formatting.
 */

const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type RiskLevelValue = (typeof RISK_LEVELS)[number];

const RISK_SCORES: Record<RiskLevelValue, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const RISK_LABELS: Record<RiskLevelValue, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
  critical: "Crítico",
};

export class RiskLevel {
  private constructor(public readonly value: RiskLevelValue) {}

  static create(value: string): RiskLevel {
    if (!RISK_LEVELS.includes(value as RiskLevelValue)) {
      throw new Error(
        `Invalid risk level: "${value}". Valid: ${RISK_LEVELS.join(", ")}`,
      );
    }
    return new RiskLevel(value as RiskLevelValue);
  }

  static low(): RiskLevel {
    return new RiskLevel("low");
  }
  static medium(): RiskLevel {
    return new RiskLevel("medium");
  }
  static high(): RiskLevel {
    return new RiskLevel("high");
  }
  static critical(): RiskLevel {
    return new RiskLevel("critical");
  }

  get score(): number {
    return RISK_SCORES[this.value];
  }

  get label(): string {
    return RISK_LABELS[this.value];
  }

  isHighOrAbove(): boolean {
    return this.score >= RISK_SCORES.high;
  }

  isCritical(): boolean {
    return this.value === "critical";
  }

  isGreaterThan(other: RiskLevel): boolean {
    return this.score > other.score;
  }

  isGreaterOrEqual(other: RiskLevel): boolean {
    return this.score >= other.score;
  }

  equals(other: RiskLevel): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
