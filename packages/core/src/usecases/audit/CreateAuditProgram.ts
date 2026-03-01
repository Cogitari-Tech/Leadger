// packages/core/src/usecases/audit/CreateAuditProgram.ts

import {
  AuditProgram,
  AuditProgramFrequency,
} from "../../entities/AuditProgram";
import { IAuditRepository } from "../../repositories/IAuditRepository";

/**
 * Use Case: Create Audit Program
 *
 * Business Rules:
 * 1. Name is required
 * 2. Start date cannot be in the distant past (>1 year)
 * 3. End date must be after start date
 * 4. Creates program in "draft" status
 */
export class CreateAuditProgram {
  constructor(private auditRepository: IAuditRepository) {}

  async execute(
    input: CreateAuditProgramInput,
  ): Promise<CreateAuditProgramOutput> {
    // Domain entity handles validation via factory
    const program = AuditProgram.create({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      frameworkId: input.frameworkId,
      frequency: input.frequency,
      projectId: input.projectId,
      startDate: input.startDate,
      endDate: input.endDate,
      createdBy: input.userId,
    });

    await this.auditRepository.saveProgram(program);

    return {
      programId: program.id,
      status: program.status,
      success: true,
    };
  }
}

export interface CreateAuditProgramInput {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  frameworkId?: string;
  frequency: AuditProgramFrequency;
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateAuditProgramOutput {
  programId: string;
  status: string;
  success: boolean;
}
