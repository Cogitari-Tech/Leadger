import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../../config/supabase";
import type {
  GitHubInstallation,
  GitHubOrganization,
  GitHubRepository,
  GitHubPullRequest,
  GitHubIssue,
  GitHubSecurityAlert,
  GitHubGovernanceEvent,
  GitHubGovernanceSnapshot,
  GovernanceKPIs,
} from "../types/github.types";

export function useGitHub() {
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [organizations, setOrganizations] = useState<GitHubOrganization[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<GitHubSecurityAlert[]>(
    [],
  );
  const [events, setEvents] = useState<GitHubGovernanceEvent[]>([]);
  const [snapshots, setSnapshots] = useState<GitHubGovernanceSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Load Functions ────────────────────────────────────────────

  const loadInstallations = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("github_installations")
      .select("*")
      .order("installed_at", { ascending: false });
    if (err) setError(err.message);
    else setInstallations(data ?? []);
  }, []);

  const loadOrganizations = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("github_organizations")
      .select("*")
      .order("login", { ascending: true });
    if (err) setError(err.message);
    else setOrganizations(data ?? []);
  }, []);

  const loadRepositories = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("github_repositories")
      .select("*")
      .order("health_score", { ascending: true });
    if (err) setError(err.message);
    else setRepositories(data ?? []);
  }, []);

  const loadPullRequests = useCallback(async (repoId?: string) => {
    let query = supabase
      .from("github_pull_requests")
      .select("*")
      .order("opened_at", { ascending: false })
      .limit(100);
    if (repoId) query = query.eq("repo_id", repoId);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setPullRequests(data ?? []);
  }, []);

  const loadIssues = useCallback(async (repoId?: string) => {
    let query = supabase
      .from("github_issues")
      .select("*")
      .order("opened_at", { ascending: false })
      .limit(100);
    if (repoId) query = query.eq("repo_id", repoId);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setIssues(data ?? []);
  }, []);

  const loadSecurityAlerts = useCallback(async (repoId?: string) => {
    let query = supabase
      .from("github_security_alerts")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(100);
    if (repoId) query = query.eq("repo_id", repoId);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setSecurityAlerts(data ?? []);
  }, []);

  const loadEvents = useCallback(async (limit = 50) => {
    const { data, error: err } = await supabase
      .from("github_governance_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (err) setError(err.message);
    else setEvents(data ?? []);
  }, []);

  const loadSnapshots = useCallback(async (limit = 30) => {
    const { data, error: err } = await supabase
      .from("github_governance_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(limit);
    if (err) setError(err.message);
    else setSnapshots(data ?? []);
  }, []);

  // ─── Computed KPIs ─────────────────────────────────────────────

  const kpis = useMemo<GovernanceKPIs>(() => {
    const totalRepos = repositories.length;
    const reposWithoutProtection = repositories.filter(
      (r) => !r.has_branch_protection,
    ).length;
    const openVulnerabilities = securityAlerts.filter(
      (a) => a.state === "open",
    ).length;
    const criticalAlerts = securityAlerts.filter(
      (a) => a.state === "open" && a.severity === "critical",
    ).length;
    const prsWithoutReview = pullRequests.filter(
      (pr) => pr.state === "merged" && pr.review_count === 0,
    ).length;
    const prsMergedByAdmin = pullRequests.filter(
      (pr) => pr.merged_by_admin,
    ).length;
    const directCommitsToMain = events.filter(
      (e) => e.event_type === "push" && e.severity === "medium",
    ).length;

    const mergedPRs = pullRequests.filter(
      (pr) => pr.state === "merged" && pr.time_to_merge_hours != null,
    );
    const avgTimeToMergeHours =
      mergedPRs.length > 0
        ? mergedPRs.reduce(
            (sum, pr) => sum + (pr.time_to_merge_hours ?? 0),
            0,
          ) / mergedPRs.length
        : 0;

    const issuesPastSLA = issues.filter((i) => i.sla_breached).length;

    // Governance score: simple weighted formula
    const protectionScore =
      totalRepos > 0
        ? ((totalRepos - reposWithoutProtection) / totalRepos) * 30
        : 30;
    const vulnScore = Math.max(0, 25 - criticalAlerts * 5);
    const reviewScore = Math.max(0, 25 - prsWithoutReview * 3);
    const slaScore = Math.max(0, 20 - issuesPastSLA * 4);
    const governanceScore = Math.round(
      Math.min(100, protectionScore + vulnScore + reviewScore + slaScore),
    );

    return {
      totalRepos,
      reposWithoutProtection,
      openVulnerabilities,
      criticalAlerts,
      prsWithoutReview,
      prsMergedByAdmin,
      directCommitsToMain,
      avgTimeToMergeHours: Math.round(avgTimeToMergeHours * 10) / 10,
      issuesPastSLA,
      governanceScore,
    };
  }, [repositories, securityAlerts, pullRequests, events, issues]);

  // ─── Initial Load ──────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([
      loadInstallations(),
      loadOrganizations(),
      loadRepositories(),
      loadPullRequests(),
      loadIssues(),
      loadSecurityAlerts(),
      loadEvents(),
      loadSnapshots(),
    ]);
    setLoading(false);
  }, [
    loadInstallations,
    loadOrganizations,
    loadRepositories,
    loadPullRequests,
    loadIssues,
    loadSecurityAlerts,
    loadEvents,
    loadSnapshots,
  ]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ─── Actions Logic ─────────────────────────────────────────────

  const createIssue = async (
    repoId: string,
    title: string,
    body: string,
    findingId?: string,
  ) => {
    try {
      const { data, error: err } = await supabase.functions.invoke(
        "github-actions",
        {
          body: {
            action: "create_issue",
            repo_id: repoId,
            title,
            body,
            finding_id: findingId,
          },
        },
      );
      if (err) throw err;
      if (data?.error) throw new Error(data.error);

      await loadIssues(); // Refresh list
      return data.issue;
    } catch (err: any) {
      console.error("Failed to create issue:", err);
      throw err;
    }
  };

  const closeIssue = async (repoId: string, issueNumber: number) => {
    try {
      const { data, error: err } = await supabase.functions.invoke(
        "github-actions",
        {
          body: {
            action: "close_issue",
            repo_id: repoId,
            issue_number: issueNumber,
          },
        },
      );
      if (err) throw err;
      if (data?.error) throw new Error(data.error);

      await loadIssues(); // Refresh list
      return data.issue;
    } catch (err: any) {
      console.error("Failed to close issue:", err);
      throw err;
    }
  };

  const linkPullRequestToFinding = async (prId: string, findingId: string) => {
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("github_pull_requests")
        .update({ linked_finding_id: findingId })
        .eq("id", prId);

      if (err) throw err;

      // Update local state optimistic
      setPullRequests((prev) =>
        prev.map((pr) =>
          pr.id === prId ? { ...pr, linked_finding_id: findingId } : pr,
        ),
      );
    } catch (err: any) {
      console.error("Failed to link PR:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const linkAlertToFinding = async (alertId: string, findingId: string) => {
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("github_security_alerts")
        .update({ linked_finding_id: findingId })
        .eq("id", alertId);

      if (err) throw err;

      // Update local state optimistic
      setSecurityAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, linked_finding_id: findingId } : a,
        ),
      );
    } catch (err: any) {
      console.error("Failed to link Alert:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    installations,
    organizations,
    repositories,
    pullRequests,
    issues,
    securityAlerts,
    events,
    snapshots,
    kpis,
    // State
    loading,
    error,
    // Actions
    loadAll,
    loadInstallations,
    loadOrganizations,
    loadRepositories,
    loadPullRequests,
    loadIssues,
    loadSecurityAlerts,
    loadEvents,
    loadSnapshots,
    createIssue,
    closeIssue,
    linkPullRequestToFinding,
    linkAlertToFinding,
  };
}
