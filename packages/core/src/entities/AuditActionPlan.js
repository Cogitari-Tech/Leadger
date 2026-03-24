// packages/core/src/entities/AuditActionPlan.ts
import { DomainError } from "../errors/DomainErrors";
import { RiskLevel } from "./value-objects/RiskLevel";
export class AuditActionPlan {
  props;
  constructor(props) {
    this.props = props;
    this.validate();
  }
  // ─── Factory Methods ───────────────────────────────────
  static create(input) {
    return new AuditActionPlan({
      id: crypto.randomUUID(),
      findingId: input.findingId,
      title: input.title,
      description: input.description ?? null,
      status: "pending",
      priority: RiskLevel.create(input.priority),
      assignedTo: null,
      dueDate: input.dueDate ?? null,
      completedAt: null,
      createdBy: input.createdBy,
      createdAt: new Date(),
    });
  }
  static fromPersistence(data) {
    return new AuditActionPlan({
      id: data.id,
      findingId: data.finding_id,
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: RiskLevel.create(data.priority),
      assignedTo: data.assigned_to ?? null,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : null,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
    });
  }
  // ─── Getters ───────────────────────────────────────────
  get id() {
    return this.props.id;
  }
  get findingId() {
    return this.props.findingId;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get status() {
    return this.props.status;
  }
  get priority() {
    return this.props.priority;
  }
  get assignedTo() {
    return this.props.assignedTo;
  }
  get dueDate() {
    return this.props.dueDate;
  }
  get completedAt() {
    return this.props.completedAt;
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  // ─── Behavior ──────────────────────────────────────────
  start() {
    if (this.props.status !== "pending") {
      throw new DomainError(
        "Only pending plans can be started",
        "INVALID_ACTION_PLAN_STATUS",
      );
    }
    this.props.status = "in_progress";
  }
  complete() {
    if (
      this.props.status !== "in_progress" &&
      this.props.status !== "pending"
    ) {
      throw new DomainError(
        "Only active plans can be completed",
        "INVALID_ACTION_PLAN_STATUS",
      );
    }
    this.props.status = "completed";
    this.props.completedAt = new Date();
  }
  markOverdue() {
    if (this.props.status === "completed") return; // no-op
    this.props.status = "overdue";
  }
  assignTo(userId) {
    this.props.assignedTo = userId;
  }
  // ─── Query Methods ─────────────────────────────────────
  isCompleted() {
    return this.props.status === "completed";
  }
  isPending() {
    return this.props.status === "pending";
  }
  isHighPriority() {
    return this.props.priority.isHighOrAbove();
  }
  isOverdue() {
    if (!this.props.dueDate || this.isCompleted()) return false;
    return new Date() > this.props.dueDate;
  }
  // ─── Persistence ───────────────────────────────────────
  toPersistence() {
    return {
      id: this.props.id,
      finding_id: this.props.findingId,
      title: this.props.title,
      description: this.props.description,
      status: this.props.status,
      priority: this.props.priority.toString(),
      assigned_to: this.props.assignedTo,
      due_date: this.props.dueDate?.toISOString().split("T")[0] ?? null,
      completed_at: this.props.completedAt?.toISOString() ?? null,
      created_by: this.props.createdBy,
      created_at: this.props.createdAt.toISOString(),
    };
  }
  // ─── Validation ────────────────────────────────────────
  validate() {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new DomainError("Action plan title is required", "MISSING_TITLE");
    }
    if (!this.props.findingId) {
      throw new DomainError(
        "Action plan must be linked to a finding",
        "MISSING_FINDING",
      );
    }
  }
}
