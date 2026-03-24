// packages/core/src/entities/AuditProgram.ts
import { DomainError } from "../errors/DomainErrors";
const VALID_TRANSITIONS = {
  draft: ["in_progress", "cancelled"],
  in_progress: ["under_review", "cancelled"],
  under_review: ["approved", "in_progress"], // reject goes back to in_progress
  approved: ["completed", "archived"],
  completed: ["archived"],
  archived: [],
  cancelled: [],
};
export class AuditProgram {
  props;
  constructor(props) {
    this.props = props;
    this.validate();
  }
  // ─── Factory Methods ───────────────────────────────────
  static create(input) {
    return new AuditProgram({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      name: input.name,
      description: input.description ?? null,
      frameworkId: input.frameworkId ?? null,
      frequency: input.frequency,
      status: "draft",
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      projectId: input.projectId ?? null,
      responsibleId: null,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  static fromPersistence(data) {
    return new AuditProgram({
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      description: data.description ?? null,
      frameworkId: data.framework_id ?? null,
      frequency: data.frequency,
      status: data.status,
      startDate: data.start_date ? new Date(data.start_date) : null,
      endDate: data.end_date ? new Date(data.end_date) : null,
      projectId: data.project_id ?? null,
      responsibleId: data.responsible_id ?? null,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }
  // ─── Getters ───────────────────────────────────────────
  get id() {
    return this.props.id;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get frameworkId() {
    return this.props.frameworkId;
  }
  get frequency() {
    return this.props.frequency;
  }
  get status() {
    return this.props.status;
  }
  get startDate() {
    return this.props.startDate;
  }
  get endDate() {
    return this.props.endDate;
  }
  get projectId() {
    return this.props.projectId;
  }
  get responsibleId() {
    return this.props.responsibleId;
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  // ─── Behavior ──────────────────────────────────────────
  transitionTo(newStatus) {
    const allowed = VALID_TRANSITIONS[this.props.status];
    if (!allowed.includes(newStatus)) {
      throw new DomainError(
        `Cannot transition from "${this.props.status}" to "${newStatus}". Allowed: [${allowed.join(", ")}]`,
        "INVALID_STATUS_TRANSITION",
      );
    }
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }
  assignResponsible(userId) {
    this.props.responsibleId = userId;
    this.props.updatedAt = new Date();
  }
  updateDetails(updates) {
    if (this.props.status !== "draft" && this.props.status !== "in_progress") {
      throw new DomainError(
        "Cannot modify a program that is under review or already approved",
        "PROGRAM_LOCKED",
      );
    }
    if (updates.name !== undefined) this.props.name = updates.name;
    if (updates.description !== undefined)
      this.props.description = updates.description;
    if (updates.frequency !== undefined)
      this.props.frequency = updates.frequency;
    if (updates.startDate !== undefined)
      this.props.startDate = updates.startDate;
    if (updates.endDate !== undefined) this.props.endDate = updates.endDate;
    this.props.updatedAt = new Date();
    this.validate();
  }
  // ─── Query Methods ─────────────────────────────────────
  isDraft() {
    return this.props.status === "draft";
  }
  isActive() {
    return this.props.status === "in_progress";
  }
  isUnderReview() {
    return this.props.status === "under_review";
  }
  isApproved() {
    return this.props.status === "approved";
  }
  isTerminal() {
    return ["completed", "archived", "cancelled"].includes(this.props.status);
  }
  canBeEdited() {
    return this.props.status === "draft" || this.props.status === "in_progress";
  }
  canBeSubmitted() {
    return this.props.status === "in_progress";
  }
  // ─── Persistence ───────────────────────────────────────
  toPersistence() {
    return {
      id: this.props.id,
      tenant_id: this.props.tenantId,
      name: this.props.name,
      description: this.props.description,
      framework_id: this.props.frameworkId,
      frequency: this.props.frequency,
      status: this.props.status,
      start_date: this.props.startDate?.toISOString().split("T")[0] ?? null,
      end_date: this.props.endDate?.toISOString().split("T")[0] ?? null,
      project_id: this.props.projectId,
      responsible_id: this.props.responsibleId,
      created_by: this.props.createdBy,
      created_at: this.props.createdAt.toISOString(),
      updated_at: this.props.updatedAt.toISOString(),
    };
  }
  // ─── Validation ────────────────────────────────────────
  validate() {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new DomainError("Program name is required", "MISSING_NAME");
    }
    if (
      this.props.startDate &&
      this.props.endDate &&
      this.props.startDate > this.props.endDate
    ) {
      throw new DomainError(
        "Start date cannot be after end date",
        "INVALID_DATE_RANGE",
      );
    }
  }
}
