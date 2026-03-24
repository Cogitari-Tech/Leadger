// packages/core/src/entities/AuditFinding.ts
import { DomainError } from "../errors/DomainErrors";
import { RiskLevel } from "./value-objects/RiskLevel";
const VALID_FINDING_TRANSITIONS = {
  draft: ["open"],
  open: ["in_progress", "accepted"],
  in_progress: ["resolved", "open"],
  resolved: ["open"], // can be reopened
  accepted: [],
};
export class AuditFinding {
  props;
  constructor(props) {
    this.props = props;
    this.validate();
  }
  // ─── Factory Methods ───────────────────────────────────
  static create(input) {
    return new AuditFinding({
      id: crypto.randomUUID(),
      programId: input.programId,
      checklistItemId: input.checklistItemId ?? null,
      title: input.title,
      description: input.description ?? null,
      riskLevel: RiskLevel.create(input.riskLevel),
      status: "draft",
      projectId: null,
      dueDate: input.dueDate ?? null,
      assignedTo: null,
      createdBy: input.createdBy,
      createdAt: new Date(),
      resolvedAt: null,
      sourceType: input.sourceType ?? "manual",
      sourceUrl: input.sourceUrl ?? null,
    });
  }
  static fromPersistence(data) {
    return new AuditFinding({
      id: data.id,
      programId: data.program_id,
      checklistItemId: data.checklist_item_id ?? null,
      title: data.title,
      description: data.description ?? null,
      riskLevel: RiskLevel.create(data.risk_level),
      status: data.status,
      projectId: data.project_id ?? null,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      assignedTo: data.assigned_to ?? null,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : null,
      sourceType: data.source_type ?? "manual",
      sourceUrl: data.source_url ?? null,
    });
  }
  // ─── Getters ───────────────────────────────────────────
  get id() {
    return this.props.id;
  }
  get programId() {
    return this.props.programId;
  }
  get checklistItemId() {
    return this.props.checklistItemId;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get riskLevel() {
    return this.props.riskLevel;
  }
  get status() {
    return this.props.status;
  }
  get projectId() {
    return this.props.projectId;
  }
  get dueDate() {
    return this.props.dueDate;
  }
  get assignedTo() {
    return this.props.assignedTo;
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get resolvedAt() {
    return this.props.resolvedAt;
  }
  get sourceType() {
    return this.props.sourceType;
  }
  get sourceUrl() {
    return this.props.sourceUrl;
  }
  // ─── Behavior ──────────────────────────────────────────
  transitionTo(newStatus) {
    const allowed = VALID_FINDING_TRANSITIONS[this.props.status];
    if (!allowed.includes(newStatus)) {
      throw new DomainError(
        `Cannot transition finding from "${this.props.status}" to "${newStatus}"`,
        "INVALID_FINDING_TRANSITION",
      );
    }
    this.props.status = newStatus;
    if (newStatus === "resolved") {
      this.props.resolvedAt = new Date();
    }
  }
  assignTo(userId) {
    this.props.assignedTo = userId;
  }
  escalateRisk(newLevel) {
    const newRisk = RiskLevel.create(newLevel);
    if (!newRisk.isGreaterThan(this.props.riskLevel)) {
      throw new DomainError(
        "Can only escalate to a higher risk level",
        "INVALID_ESCALATION",
      );
    }
    this.props.riskLevel = newRisk;
  }
  // ─── Query Methods ─────────────────────────────────────
  isHighRisk() {
    return this.props.riskLevel.isHighOrAbove();
  }
  isCritical() {
    return this.props.riskLevel.isCritical();
  }
  isResolved() {
    return this.props.status === "resolved";
  }
  isOpen() {
    return this.props.status === "open" || this.props.status === "in_progress";
  }
  isFromGitHub() {
    return this.props.sourceType === "github";
  }
  isOverdue() {
    if (!this.props.dueDate || this.isResolved()) return false;
    return new Date() > this.props.dueDate;
  }
  canBeEscalated() {
    return !this.props.riskLevel.isCritical() && this.isOpen();
  }
  // ─── Persistence ───────────────────────────────────────
  toPersistence() {
    return {
      id: this.props.id,
      program_id: this.props.programId,
      checklist_item_id: this.props.checklistItemId,
      title: this.props.title,
      description: this.props.description,
      risk_level: this.props.riskLevel.toString(),
      status: this.props.status,
      project_id: this.props.projectId,
      due_date: this.props.dueDate?.toISOString().split("T")[0] ?? null,
      assigned_to: this.props.assignedTo,
      created_by: this.props.createdBy,
      created_at: this.props.createdAt.toISOString(),
      resolved_at: this.props.resolvedAt?.toISOString() ?? null,
      source_type: this.props.sourceType,
      source_url: this.props.sourceUrl,
    };
  }
  // ─── Validation ────────────────────────────────────────
  validate() {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new DomainError("Finding title is required", "MISSING_TITLE");
    }
    if (!this.props.programId) {
      throw new DomainError(
        "Finding must belong to a program",
        "MISSING_PROGRAM",
      );
    }
  }
}
