export interface AuditFramework {
  id: string;
  tenant_id: string | null;
  name: string;
  description: string | null;
  version: string | null;
  is_system: boolean;
  created_at: string;
}

export interface AuditFrameworkControl {
  id: string;
  framework_id: string;
  code: string;
  title: string;
  description: string | null;
  category: string | null;
  sort_order: number;
}

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

export interface AuditProgram {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  framework_id: string | null;
  frequency: AuditProgramFrequency;
  status: AuditProgramStatus;
  start_date: string | null;
  end_date: string | null;
  project_id?: string | null;
  responsible_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  framework?: AuditFramework;
}

export type ChecklistItemStatus =
  | "pending"
  | "compliant"
  | "non_compliant"
  | "not_applicable";

export interface AuditProgramChecklist {
  id: string;
  program_id: string;
  control_id: string | null;
  title: string;
  description: string | null;
  status: ChecklistItemStatus;
  notes: string | null;
  checked_by: string | null;
  checked_at: string | null;
  sort_order: number;
  // Joined
  control?: AuditFrameworkControl;
}

export type AuditResponseStatus =
  | "conforme"
  | "nao_conforme"
  | "parcial"
  | "n_a";

export interface AuditItemResponse {
  id: string;
  audit_id: string;
  checklist_item_id: string;
  status: AuditResponseStatus;
  justification: string | null;
  responded_by: string;
  responded_at: string;
  tenant_id: string;
}

export interface AuditItemEvidence {
  id: string;
  audit_item_response_id: string;
  file_path: string;
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
  tenant_id: string;
}

export interface AuditVersion {
  id: string;
  audit_id: string;
  version_number: number;
  pdf_path: string | null;
  doc_hash: string;
  approved_by: string;
  approved_at: string;
  tenant_id: string;
}

export type FindingRiskLevel = "critical" | "high" | "medium" | "low";
export type FindingStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "resolved"
  | "accepted";

export interface AuditFinding {
  id: string;
  program_id: string;
  checklist_item_id: string | null;
  title: string;
  description: string | null;
  risk_level: FindingRiskLevel;
  status: FindingStatus;
  project_id?: string | null;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  resolved_at: string | null;
  source_type?: "manual" | "github";
  source_url?: string;
  // Joined
  program?: AuditProgram;
}

export type EvidenceType = "document" | "screenshot" | "log" | "link";

export interface AuditEvidence {
  id: string;
  finding_id: string | null;
  checklist_item_id: string | null;
  type: EvidenceType;
  title: string;
  description: string | null;
  url: string | null;
  uploaded_by: string;
  created_at: string;
}

export type ActionPlanStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";
export type ActionPlanPriority = "critical" | "high" | "medium" | "low";

export interface AuditActionPlan {
  id: string;
  finding_id: string;
  title: string;
  description: string | null;
  status: ActionPlanStatus;
  priority: ActionPlanPriority;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  // Joined
  finding?: AuditFinding;
}

// Form inputs
export interface CreateProgramInput {
  name: string;
  description?: string;
  framework_id?: string;
  frequency: AuditProgramFrequency;
  project_id?: string | null;
  start_date?: string;
  end_date?: string;
}

export interface CreateFindingInput {
  program_id: string;
  checklist_item_id?: string;
  title: string;
  description?: string;
  risk_level: FindingRiskLevel;
  due_date?: string;
  source_type?: "manual" | "github";
  source_url?: string;
}

export interface CreateActionPlanInput {
  finding_id: string;
  title: string;
  description?: string;
  priority: ActionPlanPriority;
  due_date?: string;
}

// Dashboard stats
export interface AuditDashboardStats {
  activePrograms: number;
  highRiskFindings: number;
  complianceRate: number;
  pendingActionPlans: number;
}

// ─── Report Generation (5W2H) ────────────────────────────

export type ReportStatus = "draft" | "signed" | "exported";
export type ExportFormat = "pdf" | "docx" | "txt" | "json";

export type TaskCategory =
  | "Frontend Bug"
  | "Backend Logic"
  | "Security Vuln"
  | "Database"
  | "DevOps/CI-CD"
  | "Code Quality"
  | "Performance"
  | "Documentation"
  | "Compliance"
  | "Infrastructure"
  | "Dependency"
  | "Architecture"
  | "Product UI/UX"
  | "Growth/Marketing"
  | "Sales/CRM"
  | "Customer Success"
  | "HR/Recruitment"
  | "Finance/Billing"
  | "Legal/Privacy"
  | "Data Science/AI"
  | "GitHub Governance";

export type ImpactArea =
  | "Segurança"
  | "Operacional"
  | "Jurídico"
  | "Privacidade"
  | "Financeiro"
  | "Reputacional"
  | "Estratégico"
  | "Experiência do Usuário"
  | "Conformidade Regulatória"
  | "Recursos Humanos"
  | "Governança de Código";

/** 5W2H methodology applied to audit findings */
export interface Finding5W2H {
  what: string; // O QUE: Descrição do problema encontrado
  why: string; // POR QUÊ: Causa raiz / justificativa
  where: string; // ONDE: Localização (módulo, arquivo, endpoint)
  when: string; // QUANDO: Data de identificação / prazo
  who: string; // QUEM: Responsável pela correção
  how: string; // COMO: Ação corretiva detalhada
  howMuch: string; // QUANTO: Impacto estimado (tempo, custo, risco)
}

export interface ReportFinding {
  id: string;
  finding_id: string;
  analysis: Finding5W2H;
  code_snippet?: string;
  task_type: TaskCategory | "";
  risk_level: FindingRiskLevel;
  status: FindingStatus;
  impacted_areas: ImpactArea[];
  evidence_links: string[];
  evidence_image_url?: string;
  notify_email?: string;
  should_notify: boolean;
}

export interface ReportSignature {
  name: string;
  role: string;
  signed_at: string;
}

export interface AuditReport {
  id?: string;
  program_id: string;
  doc_id: string;
  client_name: string;
  project_name: string;
  environment: string;
  start_date: string;
  end_date: string;
  lead_auditor: string;
  executive_summary: string;
  final_opinion: string;
  findings: ReportFinding[];
  signatures: ReportSignature[];
  status: ReportStatus;
}
