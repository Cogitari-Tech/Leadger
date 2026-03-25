import { Hono } from "hono";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { authMiddleware } from "../../middleware/auth";
import { createScopedClient } from "../../config/supabase";
import { AppEnv } from "../../types/env";

const techDebtRoutes = new Hono<AppEnv>();

// Auth and Tenancy middleware
techDebtRoutes.use("*", authMiddleware);
techDebtRoutes.use("*", tenancyMiddleware);

techDebtRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const supabase = createScopedClient(token);

  try {
    // 1. Fetch Repositories for this tenant
    const { data: repos, error: reposError } = await supabase
      .from("github_repositories")
      .select("id, name, full_name, health_score")
      .eq("tenant_id", tenantId);

    if (reposError) throw reposError;

    if (!repos || repos.length === 0) {
      return c.json({
        healthScore: 100,
        totals: {
          securityAlerts: 0,
          staleIssues: 0,
          unreviewedPrs: 0,
        },
        items: [],
      });
    }

    const repoIds = repos.map((r: any) => r.id);

    // 2. Fetch Security Alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("github_security_alerts")
      .select("*")
      .in("repo_id", repoIds)
      .eq("state", "open");

    if (alertsError) throw alertsError;

    // 3. Fetch Stale Issues (older than 30 days or specifically tagged)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: issues, error: issuesError } = await supabase
      .from("github_issues")
      .select("*")
      .in("repo_id", repoIds)
      .eq("state", "open")
      .lt("opened_at", thirtyDaysAgo.toISOString());

    if (issuesError) throw issuesError;

    // 4. Fetch PRs
    const { data: prs, error: prsError } = await supabase
      .from("github_pull_requests")
      .select("*")
      .in("repo_id", repoIds)
      .eq("state", "open");

    if (prsError) throw prsError;

    // Aggregate into "Debt Items"
    const items = [];

    // Add critical/high alerts
    for (const alert of alerts || []) {
      items.push({
        id: alert.id,
        repo: repos.find((r: any) => r.id === alert.repo_id)?.name,
        type: "vulnerability",
        title: alert.alert_type || alert.package_name || "Vulnerabilidade",
        severity: alert.severity || "high",
        age_days: Math.floor(
          (Date.now() - new Date(alert.detected_at).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
        metadata: { cve: alert.cve_id },
      });
    }

    // Add stale issues
    for (const issue of issues || []) {
      const ageDays = Math.floor(
        (Date.now() - new Date(issue.opened_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      items.push({
        id: issue.id,
        repo: repos.find((r: any) => r.id === issue.repo_id)?.name,
        type: "stale_issue",
        title: issue.title,
        severity: issue.is_critical ? "critical" : "medium",
        age_days: ageDays,
        metadata: { issue_number: issue.github_issue_number },
      });
    }

    // Add unreviewed PRs or stale PRs
    for (const pr of prs || []) {
      const ageDays = Math.floor(
        (Date.now() - new Date(pr.opened_at).getTime()) / (1000 * 60 * 60 * 24),
      );
      // Considerations: unreviewed or old
      if (pr.review_count === 0 && ageDays > 2) {
        items.push({
          id: pr.id,
          repo: repos.find((r: any) => r.id === pr.repo_id)?.name,
          type: "unreviewed_pr",
          title: pr.title,
          severity: "low",
          age_days: ageDays,
          metadata: { pr_number: pr.github_pr_number },
        });
      }
    }

    // Sort by severity (critical > high > medium > low) and age
    const severityMap: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    items.sort((a, b) => {
      const sA = severityMap[a.severity] || 0;
      const sB = severityMap[b.severity] || 0;
      if (sA !== sB) return sB - sA;
      return b.age_days - a.age_days;
    });

    // Calculate a naive Tech Debt Health Score (100 is perfect)
    let score = 100;
    const criticals = items.filter((i) => i.severity === "critical").length;
    const highs = items.filter((i) => i.severity === "high").length;
    const mediums = items.filter((i) => i.severity === "medium").length;

    score -= criticals * 10;
    score -= highs * 5;
    score -= mediums * 2;
    score = Math.max(0, score);

    return c.json({
      healthScore: score,
      totals: {
        securityAlerts: alerts?.length || 0,
        staleIssues: issues?.length || 0,
        unreviewedPrs: items.filter((i) => i.type === "unreviewed_pr").length,
      },
      items,
    });
  } catch (error) {
    console.error("Error fetching tech debt:", error);
    return c.json({ error: "Failed to fetch tech debt data." }, 500);
  }
});

export default techDebtRoutes;
