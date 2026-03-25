// packages/core/src/usecases/audit/CreateActionPlan.ts
import { AuditActionPlan } from "../../entities/AuditActionPlan";
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
  auditRepository;
  constructor(auditRepository) {
    this.auditRepository = auditRepository;
  }
  async execute(input) {
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
