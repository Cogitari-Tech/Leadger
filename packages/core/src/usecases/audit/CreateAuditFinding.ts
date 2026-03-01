// packages/core/src/usecases/audit/CreateAuditFinding.ts

import { AuditFinding } from "../../entities/AuditFinding";
import { IAuditRepository } from "../../repositories/IAuditRepository";
import { EventBus, FindingCreatedEvent } from "../../events/DomainEvent";
import { DomainError } from "../../errors/DomainErrors";
import { RiskLevelValue } from "../../entities/value-objects/RiskLevel";

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
  constructor(private auditRepository: IAuditRepository) {}

  async execute(
    input: CreateAuditFindingInput,
  ): Promise<CreateAuditFindingOutput> {
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

export interface CreateAuditFindingInput {
  programId: string;
  checklistItemId?: string;
  title: string;
  description?: string;
  riskLevel: RiskLevelValue;
  dueDate?: Date;
  userId: string;
  sourceType?: "manual" | "github";
  sourceUrl?: string;
}

export interface CreateAuditFindingOutput {
  findingId: string;
  riskLevel: string;
  success: boolean;
}
