// packages/core/src/entities/AuditProgram.ts

import { DomainError } from "../errors/DomainErrors";

/**
 * Entity (Aggregate Root): Audit Program
 *
 * Represents an audit program lifecycle from draft to completion.
 * Controls state transitions and invariants.
 */

export type AuditProgramFrequency =
  | "annual"
  | "semi_annual"
  | "quarterly"
  | "monthly"
  | "biweekly"
  | "weekly";

export type AuditProgramStatus =
  | "draft"
  | "in_progress"
  | "under_review"
  | "approved"
  | "archived"
  | "completed"
  | "cancelled";

const VALID_TRANSITIONS: Record<AuditProgramStatus, AuditProgramStatus[]> = {
  draft: ["in_progress", "cancelled"],
  in_progress: ["under_review", "cancelled"],
  under_review: ["approved", "in_progress"], // reject goes back to in_progress
  approved: ["completed", "archived"],
  completed: ["archived"],
  archived: [],
  cancelled: [],
};

export interface AuditProgramProps {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  frameworkId: string | null;
  frequency: AuditProgramFrequency;
  status: AuditProgramStatus;
  startDate: Date | null;
  endDate: Date | null;
  projectId: string | null;
  responsibleId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuditProgram {
  private constructor(private props: AuditProgramProps) {
    this.validate();
  }

  // ─── Factory Methods ───────────────────────────────────

  static create(input: {
    tenantId: string;
    name: string;
    description?: string;
    frameworkId?: string;
    frequency: AuditProgramFrequency;
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    createdBy: string;
  }): AuditProgram {
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

  static fromPersistence(data: Record<string, unknown>): AuditProgram {
    return new AuditProgram({
      id: data.id as string,
      tenantId: data.tenant_id as string,
      name: data.name as string,
      description: (data.description as string) ?? null,
      frameworkId: (data.framework_id as string) ?? null,
      frequency: data.frequency as AuditProgramFrequency,
      status: data.status as AuditProgramStatus,
      startDate: data.start_date ? new Date(data.start_date as string) : null,
      endDate: data.end_date ? new Date(data.end_date as string) : null,
      projectId: (data.project_id as string) ?? null,
      responsibleId: (data.responsible_id as string) ?? null,
      createdBy: data.created_by as string,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    });
  }

  // ─── Getters ───────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | null {
    return this.props.description;
  }
  get frameworkId(): string | null {
    return this.props.frameworkId;
  }
  get frequency(): AuditProgramFrequency {
    return this.props.frequency;
  }
  get status(): AuditProgramStatus {
    return this.props.status;
  }
  get startDate(): Date | null {
    return this.props.startDate;
  }
  get endDate(): Date | null {
    return this.props.endDate;
  }
  get projectId(): string | null {
    return this.props.projectId;
  }
  get responsibleId(): string | null {
    return this.props.responsibleId;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ─── Behavior ──────────────────────────────────────────

  transitionTo(newStatus: AuditProgramStatus): void {
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

  assignResponsible(userId: string): void {
    this.props.responsibleId = userId;
    this.props.updatedAt = new Date();
  }

  updateDetails(updates: {
    name?: string;
    description?: string;
    frequency?: AuditProgramFrequency;
    startDate?: Date;
    endDate?: Date;
  }): void {
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

  isDraft(): boolean {
    return this.props.status === "draft";
  }
  isActive(): boolean {
    return this.props.status === "in_progress";
  }
  isUnderReview(): boolean {
    return this.props.status === "under_review";
  }
  isApproved(): boolean {
    return this.props.status === "approved";
  }
  isTerminal(): boolean {
    return ["completed", "archived", "cancelled"].includes(this.props.status);
  }

  canBeEdited(): boolean {
    return this.props.status === "draft" || this.props.status === "in_progress";
  }

  canBeSubmitted(): boolean {
    return this.props.status === "in_progress";
  }

  // ─── Persistence ───────────────────────────────────────

  toPersistence(): Record<string, unknown> {
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

  private validate(): void {
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
