// packages/core/src/usecases/audit/CreateAuditFinding.ts
import { AuditFinding } from "../../entities/AuditFinding";
import { EventBus, FindingCreatedEvent } from "../../events/DomainEvent";
import { DomainError } from "../../errors/DomainErrors";
/**
 * Use Case: Create Audit Finding
 *
 * Business Rules:
 * 1. Program must exist
 * 2. Title is required
 * 3. Risk level must be valid
 * 4. Publishes FindingCreatedEvent for cross-context reaction
 */
export class CreateAuditFinding {
  auditRepository;
  constructor(auditRepository) {
    this.auditRepository = auditRepository;
  }
  async execute(input) {
    // Verify program exists
    const program = await this.auditRepository.getProgramById(input.programId);
    if (!program) {
      throw new DomainError("Program not found", "PROGRAM_NOT_FOUND");
    }
    // Entity factory handles domain validation
    const finding = AuditFinding.create({
      programId: input.programId,
      checklistItemId: input.checklistItemId,
      title: input.title,
      description: input.description,
      riskLevel: input.riskLevel,
      dueDate: input.dueDate,
      createdBy: input.userId,
      sourceType: input.sourceType,
      sourceUrl: input.sourceUrl,
    });
    await this.auditRepository.saveFinding(finding);
    // Publish domain event
    await EventBus.getInstance().publish(
      new FindingCreatedEvent(
        finding.id,
        finding.programId,
        finding.riskLevel.toString(),
      ),
    );
    return {
      findingId: finding.id,
      riskLevel: finding.riskLevel.toString(),
      success: true,
    };
  }
}
