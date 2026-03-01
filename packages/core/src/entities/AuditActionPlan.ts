// packages/core/src/entities/AuditActionPlan.ts

import { DomainError } from "../errors/DomainErrors";
import { RiskLevel } from "./value-objects/RiskLevel";

/**
 * Entity: Audit Action Plan
 *
 * Represents a corrective action tied to a finding.
 * Tracks lifecycle from pending to completion.
 */

export type ActionPlanStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";
export type ActionPlanPriority = "critical" | "high" | "medium" | "low";

export interface ActionPlanProps {
  id: string;
  findingId: string;
  title: string;
  description: string | null;
  status: ActionPlanStatus;
  priority: RiskLevel;
  assignedTo: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
  createdBy: string;
  createdAt: Date;
}

export class AuditActionPlan {
  private constructor(private props: ActionPlanProps) {
    this.validate();
  }

  // ─── Factory Methods ───────────────────────────────────

  static create(input: {
    findingId: string;
    title: string;
    description?: string;
    priority: ActionPlanPriority;
    dueDate?: Date;
    createdBy: string;
  }): AuditActionPlan {
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

  static fromPersistence(data: Record<string, unknown>): AuditActionPlan {
    return new AuditActionPlan({
      id: data.id as string,
      findingId: data.finding_id as string,
      title: data.title as string,
      description: (data.description as string) ?? null,
      status: data.status as ActionPlanStatus,
      priority: RiskLevel.create(data.priority as string),
      assignedTo: (data.assigned_to as string) ?? null,
      dueDate: data.due_date ? new Date(data.due_date as string) : null,
      completedAt: data.completed_at
        ? new Date(data.completed_at as string)
        : null,
      createdBy: data.created_by as string,
      createdAt: new Date(data.created_at as string),
    });
  }

  // ─── Getters ───────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }
  get findingId(): string {
    return this.props.findingId;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string | null {
    return this.props.description;
  }
  get status(): ActionPlanStatus {
    return this.props.status;
  }
  get priority(): RiskLevel {
    return this.props.priority;
  }
  get assignedTo(): string | null {
    return this.props.assignedTo;
  }
  get dueDate(): Date | null {
    return this.props.dueDate;
  }
  get completedAt(): Date | null {
    return this.props.completedAt;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  // ─── Behavior ──────────────────────────────────────────

  start(): void {
    if (this.props.status !== "pending") {
      throw new DomainError(
        "Only pending plans can be started",
        "INVALID_ACTION_PLAN_STATUS",
      );
    }
    this.props.status = "in_progress";
  }

  complete(): void {
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

  markOverdue(): void {
    if (this.props.status === "completed") return; // no-op
    this.props.status = "overdue";
  }

  assignTo(userId: string): void {
    this.props.assignedTo = userId;
  }

  // ─── Query Methods ─────────────────────────────────────

  isCompleted(): boolean {
    return this.props.status === "completed";
  }
  isPending(): boolean {
    return this.props.status === "pending";
  }
  isHighPriority(): boolean {
    return this.props.priority.isHighOrAbove();
  }

  isOverdue(): boolean {
    if (!this.props.dueDate || this.isCompleted()) return false;
    return new Date() > this.props.dueDate;
  }

  // ─── Persistence ───────────────────────────────────────

  toPersistence(): Record<string, unknown> {
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

  private validate(): void {
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
