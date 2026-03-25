// packages/core/src/entities/value-objects/ComplianceScore.ts

/**
 * Value Object: Compliance Score
 *
 * Calculates compliance percentage and classifies into grades.
 * Immutable — every operation returns a new instance.
 */

type ComplianceGrade = "A" | "B" | "C" | "D" | "F";

const GRADE_THRESHOLDS: { min: number; grade: ComplianceGrade }[] = [
  { min: 90, grade: "A" },
  { min: 75, grade: "B" },
  { min: 60, grade: "C" },
  { min: 40, grade: "D" },
  { min: 0, grade: "F" },
];

export class ComplianceScore {
  public readonly percentage: number;

  private constructor(
    public readonly resolved: number,
    public readonly total: number,
  ) {
    if (total < 0 || resolved < 0) {
      throw new Error("Resolved and total must be non-negative");
    }
    if (resolved > total) {
      throw new Error("Resolved cannot exceed total");
    }
    this.percentage = total > 0 ? Math.round((resolved / total) * 100) : 100;
  }

  static create(resolved: number, total: number): ComplianceScore {
    return new ComplianceScore(resolved, total);
  }

  static perfect(): ComplianceScore {
    return new ComplianceScore(1, 1);
  }

  get grade(): ComplianceGrade {
    const match = GRADE_THRESHOLDS.find((t) => this.percentage >= t.min);
    return match?.grade ?? "F";
  }

  get isAcceptable(): boolean {
    return this.percentage >= 60;
  }

  get isExcellent(): boolean {
    return this.percentage >= 90;
  }

  get pending(): number {
    return this.total - this.resolved;
  }

  format(): string {
    return `${this.percentage}% (${this.grade})`;
  }

  isGreaterThan(other: ComplianceScore): boolean {
    return this.percentage > other.percentage;
  }

  equals(other: ComplianceScore): boolean {
    return this.percentage === other.percentage;
  }
}
