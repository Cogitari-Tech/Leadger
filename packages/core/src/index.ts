// packages/core/src/index.ts

// ─── Finance Domain ──────────────────────────────────────
export * from "./entities/Transaction";
export * from "./entities/Account";
export * from "./repositories/IFinanceRepository";
export * from "./usecases/finance/RecordTransaction";

// ─── Audit Domain ────────────────────────────────────────
export * from "./entities/AuditProgram";
export * from "./entities/AuditFinding";
export * from "./entities/AuditActionPlan";
export * from "./entities/value-objects/RiskLevel";
export * from "./entities/value-objects/ComplianceScore";
export * from "./repositories/IAuditRepository";
export * from "./usecases/audit/CreateAuditProgram";
export * from "./usecases/audit/CreateAuditFinding";
export * from "./usecases/audit/CreateActionPlan";

// ─── Shared ──────────────────────────────────────────────
export * from "./errors/DomainErrors";
export * from "./events/DomainEvent";

// ─── GitHub Domain ───────────────────────────────────────
export * from "./repositories/IGitHubRepository";

// ─── Projects Domain ─────────────────────────────────────
export * from "./repositories/IProjectRepository";
