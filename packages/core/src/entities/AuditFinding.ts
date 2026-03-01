// packages/core/src/entities/AuditFinding.ts

import { DomainError } from "../errors/DomainErrors";
import { RiskLevel, RiskLevelValue } from "./value-objects/RiskLevel";

/**
 * Entity: Audit Finding
 *
 * Represents a finding (issue) discovered during an audit.
 * Uses RiskLevel Value Object for risk classification.
 */

export type FindingStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "resolved"
  | "accepted";

const VALID_FINDING_TRANSITIONS: Record<FindingStatus, FindingStatus[]> = {
  draft: ["open"],
  open: ["in_progress", "accepted"],
  in_progress: ["resolved", "open"],
  resolved: ["open"], // can be reopened
  accepted: [],
};

export interface AuditFindingProps {
  id: string;
  programId: string;
  checklistItemId: string | null;
  title: string;
  description: string | null;
  riskLevel: RiskLevel;
  status: FindingStatus;
  projectId: string | null;
  dueDate: Date | null;
  assignedTo: string | null;
  createdBy: string;
  createdAt: Date;
  resolvedAt: Date | null;
  sourceType: "manual" | "github";
  sourceUrl: string | null;
}

export class AuditFinding {
  private constructor(private props: AuditFindingProps) {
    this.validate();
  }

  // ─── Factory Methods ───────────────────────────────────

  static create(input: {
    programId: string;
    checklistItemId?: string;
    title: string;
    description?: string;
    riskLevel: RiskLevelValue;
    dueDate?: Date;
    createdBy: string;
    sourceType?: "manual" | "github";
    sourceUrl?: string;
  }): AuditFinding {
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

  static fromPersistence(data: Record<string, unknown>): AuditFinding {
    return new AuditFinding({
      id: data.id as string,
      programId: data.program_id as string,
      checklistItemId: (data.checklist_item_id as string) ?? null,
      title: data.title as string,
      description: (data.description as string) ?? null,
      riskLevel: RiskLevel.create(data.risk_level as string),
      status: data.status as FindingStatus,
      projectId: (data.project_id as string) ?? null,
      dueDate: data.due_date ? new Date(data.due_date as string) : null,
      assignedTo: (data.assigned_to as string) ?? null,
      createdBy: data.created_by as string,
      createdAt: new Date(data.created_at as string),
      resolvedAt: data.resolved_at
        ? new Date(data.resolved_at as string)
        : null,
      sourceType: (data.source_type as "manual" | "github") ?? "manual",
      sourceUrl: (data.source_url as string) ?? null,
    });
  }

  // ─── Getters ───────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }
  get programId(): string {
    return this.props.programId;
  }
  get checklistItemId(): string | null {
    return this.props.checklistItemId;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string | null {
    return this.props.description;
  }
  get riskLevel(): RiskLevel {
    return this.props.riskLevel;
  }
  get status(): FindingStatus {
    return this.props.status;
  }
  get projectId(): string | null {
    return this.props.projectId;
  }
  get dueDate(): Date | null {
    return this.props.dueDate;
  }
  get assignedTo(): string | null {
    return this.props.assignedTo;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }
  get sourceType(): string {
    return this.props.sourceType;
  }
  get sourceUrl(): string | null {
    return this.props.sourceUrl;
  }

  // ─── Behavior ──────────────────────────────────────────

  transitionTo(newStatus: FindingStatus): void {
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

  assignTo(userId: string): void {
    this.props.assignedTo = userId;
  }

  escalateRisk(newLevel: RiskLevelValue): void {
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

  isHighRisk(): boolean {
    return this.props.riskLevel.isHighOrAbove();
  }
  isCritical(): boolean {
    return this.props.riskLevel.isCritical();
  }
  isResolved(): boolean {
    return this.props.status === "resolved";
  }
  isOpen(): boolean {
    return this.props.status === "open" || this.props.status === "in_progress";
  }
  isFromGitHub(): boolean {
    return this.props.sourceType === "github";
  }

  isOverdue(): boolean {
    if (!this.props.dueDate || this.isResolved()) return false;
    return new Date() > this.props.dueDate;
  }

  canBeEscalated(): boolean {
    return !this.props.riskLevel.isCritical() && this.isOpen();
  }

  // ─── Persistence ───────────────────────────────────────

  toPersistence(): Record<string, unknown> {
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

  private validate(): void {
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
