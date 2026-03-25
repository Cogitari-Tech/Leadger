import { useMemo } from "react";
import { useAuditStore } from "../../../store/auditStore";
import type {
  FindingRiskLevel,
  FindingStatus,
  AuditProgramStatus,
  ActionPlanStatus,
} from "../types/audit.types";

// ─── Chart-ready data shapes ──────────────────────────────

export interface RiskDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface TrendPoint {
  month: string;
  created: number;
  resolved: number;
}

export interface ProgramStatusItem {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface ActionPlanVelocityItem {
  label: string;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

export interface AnalyticsKPIs {
  totalFindings: number;
  mttrHours: number;
  activePrograms: number;
  complianceRate: number;
}

// ─── Color Constants ──────────────────────────────────────

const RISK_COLORS: Record<FindingRiskLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

const RISK_LABELS: Record<FindingRiskLevel, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  in_progress: "#3b82f6",
  under_review: "#f59e0b",
  approved: "#0ea5e9",
  completed: "#10b981",
  archived: "#64748b",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<AuditProgramStatus, string> = {
  draft: "Rascunho",
  in_progress: "Em Andamento",
  under_review: "Em Revisão",
  approved: "Aprovado",
  completed: "Concluído",
  archived: "Arquivado",
  cancelled: "Cancelado",
};

// ─── Helper: months for trend ────────────────────────────

function getLastMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    );
  }
  return months;
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

// ─── Hook ─────────────────────────────────────────────────

export function useAuditAnalytics() {
  const programs = useAuditStore((s) => s.programs);
  const findings = useAuditStore((s) => s.findings);
  const actionPlans = useAuditStore((s) => s.actionPlans);

  // ── KPIs ──────────────────────────────────────────────

  const kpis = useMemo<AnalyticsKPIs>(() => {
    const activePrograms = programs.filter(
      (p) => p.status === "in_progress" || p.status === "under_review",
    ).length;

    const resolvedFindings = findings.filter(
      (f) => f.status === "resolved" && f.resolved_at && f.created_at,
    );

    const mttrHours =
      resolvedFindings.length > 0
        ? Math.round(
            resolvedFindings.reduce((acc, f) => {
              const created = new Date(f.created_at).getTime();
              const resolved = new Date(f.resolved_at!).getTime();
              return acc + (resolved - created) / (1000 * 60 * 60);
            }, 0) / resolvedFindings.length,
          )
        : 0;

    const total = findings.length;
    const resolved = findings.filter(
      (f) => f.status === "resolved" || f.status === "accepted",
    ).length;
    const complianceRate =
      total > 0 ? Math.round((resolved / total) * 100) : 100;

    return {
      totalFindings: total,
      mttrHours,
      activePrograms,
      complianceRate,
    };
  }, [programs, findings]);

  // ── Risk Distribution (Donut) ──────────────────────────

  const riskDistribution = useMemo<RiskDistributionItem[]>(() => {
    const counts: Record<FindingRiskLevel, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    findings.forEach((f) => {
      if (counts[f.risk_level] !== undefined) {
        counts[f.risk_level]++;
      }
    });

    return (Object.keys(counts) as FindingRiskLevel[]).map((level) => ({
      name: RISK_LABELS[level],
      value: counts[level],
      color: RISK_COLORS[level],
    }));
  }, [findings]);

  // ── Findings Trend (Area Chart - last 6 months) ────────

  const findingsTrend = useMemo<TrendPoint[]>(() => {
    const months = getLastMonths(6);
    const created: Record<string, number> = {};
    const resolved: Record<string, number> = {};

    months.forEach((m) => {
      created[m] = 0;
      resolved[m] = 0;
    });

    findings.forEach((f) => {
      const key = getMonthKey(f.created_at);
      if (created[key] !== undefined) created[key]++;
      if (f.resolved_at) {
        const rKey = getMonthKey(f.resolved_at);
        if (resolved[rKey] !== undefined) resolved[rKey]++;
      }
    });

    return months.map((m) => ({
      month: m,
      created: created[m],
      resolved: resolved[m],
    }));
  }, [findings]);

  // ── Programs by Status (Bar) ──────────────────────────

  const programsByStatus = useMemo<ProgramStatusItem[]>(() => {
    const counts: Record<string, number> = {};

    programs.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      status,
      label: STATUS_LABELS[status as AuditProgramStatus] ?? status,
      count,
      color: STATUS_COLORS[status] ?? "#94a3b8",
    }));
  }, [programs]);

  // ── Action Plan Velocity ────────────────────────────────

  const actionPlanVelocity = useMemo(() => {
    const statusCounts: Record<ActionPlanStatus, number> = {
      completed: 0,
      in_progress: 0,
      pending: 0,
      overdue: 0,
    };

    actionPlans.forEach((ap) => {
      if (statusCounts[ap.status] !== undefined) {
        statusCounts[ap.status]++;
      }
    });

    return statusCounts;
  }, [actionPlans]);

  // ── Findings by Status ─────────────────────────────────

  const findingsByStatus = useMemo(() => {
    const statusLabels: Record<FindingStatus, string> = {
      draft: "Rascunho",
      open: "Aberto",
      in_progress: "Em Andamento",
      resolved: "Resolvido",
      accepted: "Aceito",
    };

    const statusColors: Record<FindingStatus, string> = {
      draft: "#94a3b8",
      open: "#f59e0b",
      in_progress: "#3b82f6",
      resolved: "#10b981",
      accepted: "#0ea5e9",
    };

    const counts: Record<string, number> = {};
    findings.forEach((f) => {
      counts[f.status] = (counts[f.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: statusLabels[status as FindingStatus] ?? status,
      value: count,
      color: statusColors[status as FindingStatus] ?? "#94a3b8",
    }));
  }, [findings]);

  return {
    kpis,
    riskDistribution,
    findingsTrend,
    programsByStatus,
    actionPlanVelocity,
    findingsByStatus,
    hasData: findings.length > 0 || programs.length > 0,
  };
}
