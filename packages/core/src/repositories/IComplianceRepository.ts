// packages/core/src/repositories/IComplianceRepository.ts

/**
 * Port: Compliance Repository Interface
 *
 * Defines contracts for compliance data access.
 * Segregated by aggregate: Frameworks, Risks, SWOT.
 */

// ─── Framework ──────────────────────────────────────────

export interface IFrameworkRepository {
  listFrameworks(tenantId: string): Promise<FrameworkDTO[]>;
  listControls(frameworkIds: string[]): Promise<ControlDTO[]>;
}

export interface ControlDTO {
  id: string;
  framework_id: string;
  code: string;
  title: string;
  description: string;
  // We don't include status here because status is computed in the hook/service based on checklists
}

export interface FrameworkDTO {
  id: string;
  name: string;
  description: string;
  version: string;
  status: string;
  progress: number;
  controlsCount: number;
  compliantCount: number;
  lastUpdated: string;
}

// ─── Risk ───────────────────────────────────────────────

export interface IRiskRepository {
  listRisks(tenantId: string): Promise<RiskDTO[]>;
  addRisk(tenantId: string, data: CreateRiskInput): Promise<RiskDTO>;
  removeRisk(id: string): Promise<void>;
}

export interface RiskDTO {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  score: number;
  status: string;
  owner?: string;
  createdAt: string;
}

export interface CreateRiskInput {
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  score: number;
  status: string;
  owner?: string;
}

// ─── SWOT ───────────────────────────────────────────────

export interface ISwotRepository {
  listItems(tenantId: string): Promise<SwotDTO[]>;
  addItem(tenantId: string, data: CreateSwotInput): Promise<SwotDTO>;
  removeItem(id: string): Promise<void>;
}

export interface SwotDTO {
  id: string;
  tenant_id: string;
  type: string;
  title: string;
  description: string;
  impact: number;
  createdAt: string;
}

export interface CreateSwotInput {
  type: string;
  title: string;
  description: string;
  impact: number;
}

// ─── Composed Interface ─────────────────────────────────

export interface IComplianceRepository
  extends IFrameworkRepository, IRiskRepository, ISwotRepository {}
