// packages/core/src/usecases/audit/CreateActionPlan.ts

import {
  AuditActionPlan,
  ActionPlanPriority,
} from "../../entities/AuditActionPlan";
import { IAuditRepository } from "../../repositories/IAuditRepository";
import { DomainError } from "../../errors/DomainErrors";

/**
 * Use Case: Create Action Plan
 *
 * Business Rules:
 * 1. Finding must exist
 * 2. Title is required
 * 3. Due date cannot be in the past when creating
 */
export class CreateActionPlan {
  constructor(private auditRepository: IAuditRepository) {}

  async execute(input: CreateActionPlanInput): Promise<CreateActionPlanOutput> {
    // Verify finding exists
    const finding = await this.auditRepository.getFindingById(input.findingId);
    if (!finding) {
      throw new DomainError("Finding not found", "FINDING_NOT_FOUND");
    }

    const plan = AuditActionPlan.create({
      findingId: input.findingId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
      createdBy: input.userId,
    });

    await this.auditRepository.saveActionPlan(plan);

    return {
      actionPlanId: plan.id,
      success: true,
    };
  }
}

export interface CreateActionPlanInput {
  findingId: string;
  title: string;
  description?: string;
  priority: ActionPlanPriority;
  dueDate?: Date;
  userId: string;
}

export interface CreateActionPlanOutput {
  actionPlanId: string;
  success: boolean;
}
