import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

export interface ExecutiveKPIs {
  audit: {
    activePrograms: number;
    underReview: number;
    openFindings: number;
    criticalFindings: number;
  };
  compliance: {
    activeFrameworks: number;
    nonCompliantPending: number;
    totalChecked: number;
    compliantItems: number;
  };
  github: {
    openVulnerabilities: number;
    criticalVulnerabilities: number;
    totalRepos: number;
    highestRiskRepos: Array<{ name: string; vulns: number }>;
  };
  finance: {
    totalTransactions: number;
    totalAccounts: number;
    monthlyExpenses: number;
    monthlyRevenue: number;
  };
  pendingDecisions: Array<{
    id: string;
    type: "approval" | "finding" | "vulnerability";
    title: string;
    severity: string;
    timestamp: string;
  }>;
  loading: boolean;
  error: string | null;
}

export function useExecutiveDashboard(): ExecutiveKPIs {
  const { user } = useAuth();
  const tenantId = user?.tenant_id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<Omit<ExecutiveKPIs, "loading" | "error">>({
    audit: {
      activePrograms: 0,
      underReview: 0,
      openFindings: 0,
      criticalFindings: 0,
    },
    compliance: {
      activeFrameworks: 0,
      nonCompliantPending: 0,
      totalChecked: 0,
      compliantItems: 0,
    },
    github: {
      openVulnerabilities: 0,
      criticalVulnerabilities: 0,
      totalRepos: 0,
      highestRiskRepos: [],
    },
    finance: {
      totalTransactions: 0,
      totalAccounts: 0,
      monthlyExpenses: 0,
      monthlyRevenue: 0,
    },
    pendingDecisions: [],
  });

  useEffect(() => {
    if (!tenantId) return;

    async function fetchKPIs() {
      setLoading(true);
      setError(null);

      try {
        // Calculate date range for current month finance data
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];

        // Parallel queries for performance
        const [
          programsRes,
          findingsRes,
          frameworksRes,
          checklistRes,
          reposRes,
          alertsRes,
          pendingApprovalsRes,
          transactionsCountRes,
          accountsCountRes,
          monthlyTransactionsRes,
        ] = await Promise.all([
          // Audit Programs
          supabase
            .from("audit_programs")
            .select("id, status")
            .eq("tenant_id", tenantId)
            .in("status", ["draft", "in_progress", "under_review", "approved"]),

          // Audit Findings (open)
          supabase
            .from("audit_findings")
            .select("id, risk_level, status")
            .in("status", ["open", "in_progress", "draft"]),

          // Frameworks
          supabase.from("audit_frameworks").select("id"),

          // Checklists
          supabase.from("audit_program_checklists").select("id, status"),

          // GitHub Repos
          supabase
            .from("github_repositories")
            .select("id, name, open_vulnerabilities_count")
            .eq("tenant_id", tenantId)
            .order("open_vulnerabilities_count", { ascending: false }),

          // GitHub Security Alerts
          supabase
            .from("github_security_alerts")
            .select("id, severity, state")
            .eq("state", "open"),

          // Pending Approvals (under_review programs)
          supabase
            .from("audit_programs")
            .select("id, name, updated_at")
            .eq("tenant_id", tenantId)
            .eq("status", "under_review")
            .order("updated_at", { ascending: false })
            .limit(5),

          // Finance: Total transactions count
          supabase
            .from("transactions")
            .select("id", { count: "exact", head: true }),

          // Finance: Total accounts count
          supabase
            .from("accounts")
            .select("id", { count: "exact", head: true }),

          // Finance: Monthly transactions with amount and accounts
          supabase
            .from("transactions")
            .select("id, amount, account_debit_id, account_credit_id, date")
            .gte("date", monthStart)
            .lte("date", monthEnd),
        ]);

        const programs = programsRes.data || [];
        const findings = findingsRes.data || [];
        const frameworks = frameworksRes.data || [];
        const checklists = checklistRes.data || [];
        const repos = reposRes.data || [];
        const alerts = alertsRes.data || [];
        const pendingApprovals = pendingApprovalsRes.data || [];
        const monthlyTransactions = monthlyTransactionsRes.data || [];

        // Aggregate audit KPIs
        const activePrograms = programs.filter((p) =>
          ["in_progress", "under_review"].includes(p.status),
        ).length;
        const underReview = programs.filter(
          (p) => p.status === "under_review",
        ).length;
        const openFindings = findings.length;
        const criticalFindings = findings.filter(
          (f) => f.risk_level === "critical",
        ).length;

        // Aggregate compliance KPIs
        const totalChecked = checklists.filter(
          (c) => c.status !== "pending",
        ).length;
        const compliantItems = checklists.filter(
          (c) => c.status === "compliant",
        ).length;
        const nonCompliantPending = checklists.filter(
          (c) => c.status === "non_compliant",
        ).length;

        // Aggregate GitHub KPIs
        const openVulnerabilities = alerts.length;
        const criticalVulnerabilities = alerts.filter(
          (a) => a.severity === "critical",
        ).length;
        const highestRiskRepos = repos
          .filter((r) => (r.open_vulnerabilities_count || 0) > 0)
          .slice(0, 5)
          .map((r) => ({
            name: r.name,
            vulns: r.open_vulnerabilities_count || 0,
          }));

        // Aggregate Finance KPIs
        const totalTransactions = transactionsCountRes.count || 0;
        const totalAccounts = accountsCountRes.count || 0;
        // Simplified: sum all monthly transaction amounts as a proxy
        const monthlyRevenue = monthlyTransactions.reduce(
          (sum: number, t: any) => sum + (Number(t.amount) || 0),
          0,
        );
        const monthlyExpenses = monthlyRevenue; // Mirror for now since we use double-entry

        // Build pending decisions
        const decisions: ExecutiveKPIs["pendingDecisions"] = [];
        pendingApprovals.forEach((p) => {
          decisions.push({
            id: p.id,
            type: "approval",
            title: `Aprovar: ${p.name}`,
            severity: "high",
            timestamp: p.updated_at,
          });
        });
        findings
          .filter((f) => f.risk_level === "critical")
          .slice(0, 3)
          .forEach((f) => {
            decisions.push({
              id: f.id,
              type: "finding",
              title: `Finding Crítico #${f.id.slice(0, 8)}`,
              severity: "critical",
              timestamp: "",
            });
          });

        setKpis({
          audit: {
            activePrograms,
            underReview,
            openFindings,
            criticalFindings,
          },
          compliance: {
            activeFrameworks: frameworks.length,
            nonCompliantPending,
            totalChecked,
            compliantItems,
          },
          github: {
            openVulnerabilities,
            criticalVulnerabilities,
            totalRepos: repos.length,
            highestRiskRepos,
          },
          finance: {
            totalTransactions,
            totalAccounts,
            monthlyExpenses,
            monthlyRevenue,
          },
          pendingDecisions: decisions,
        });
      } catch (err: any) {
        console.error("Executive dashboard fetch error:", err);
        setError(err.message || "Erro ao carregar KPIs.");
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, [tenantId]);

  return { ...kpis, loading, error };
}
