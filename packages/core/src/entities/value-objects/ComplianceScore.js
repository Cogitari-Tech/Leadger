// packages/core/src/entities/value-objects/ComplianceScore.ts
const GRADE_THRESHOLDS = [
  { min: 90, grade: "A" },
  { min: 75, grade: "B" },
  { min: 60, grade: "C" },
  { min: 40, grade: "D" },
  { min: 0, grade: "F" },
];
export class ComplianceScore {
  resolved;
  total;
  percentage;
  constructor(resolved, total) {
    this.resolved = resolved;
    this.total = total;
    if (total < 0 || resolved < 0) {
      throw new Error("Resolved and total must be non-negative");
    }
    if (resolved > total) {
      throw new Error("Resolved cannot exceed total");
    }
    this.percentage = total > 0 ? Math.round((resolved / total) * 100) : 100;
  }
  static create(resolved, total) {
    return new ComplianceScore(resolved, total);
  }
  static perfect() {
    return new ComplianceScore(1, 1);
  }
  get grade() {
    const match = GRADE_THRESHOLDS.find((t) => this.percentage >= t.min);
    return match?.grade ?? "F";
  }
  get isAcceptable() {
    return this.percentage >= 60;
  }
  get isExcellent() {
    return this.percentage >= 90;
  }
  get pending() {
    return this.total - this.resolved;
  }
  format() {
    return `${this.percentage}% (${this.grade})`;
  }
  isGreaterThan(other) {
    return this.percentage > other.percentage;
  }
  equals(other) {
    return this.percentage === other.percentage;
  }
}
