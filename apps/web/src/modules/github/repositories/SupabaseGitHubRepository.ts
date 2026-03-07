// apps/web/src/modules/github/repositories/SupabaseGitHubRepository.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IGitHubRepository,
  GitHubOrgDTO,
  GitHubRepoDTO,
  GitHubPRDTO,
  GitHubIssueDTO,
  GitHubAlertDTO,
  GitHubSnapshotDTO,
  GitHubEventDTO,
} from "@leadgers/core/repositories/IGitHubRepository";

/**
 * Adapter: Supabase implementation of IGitHubRepository
 */
export class SupabaseGitHubRepository implements IGitHubRepository {
  constructor(private supabase: SupabaseClient) {}

  async listOrganizations(_tenantId: string): Promise<GitHubOrgDTO[]> {
    const { data, error } = await this.supabase
      .from("github_organizations")
      .select("*")
      .order("login", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.mapOrg);
  }

  async getOrganizationById(id: string): Promise<GitHubOrgDTO | null> {
    const { data, error } = await this.supabase
      .from("github_organizations")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return this.mapOrg(data);
  }

  async listRepositories(
    _tenantId: string,
    orgId?: string,
  ): Promise<GitHubRepoDTO[]> {
    let query = this.supabase
      .from("github_repositories")
      .select("*")
      .order("health_score", { ascending: true });
    if (orgId) query = query.eq("org_id", orgId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(this.mapRepo);
  }

  async getRepositoryById(id: string): Promise<GitHubRepoDTO | null> {
    const { data, error } = await this.supabase
      .from("github_repositories")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return this.mapRepo(data);
  }

  async listPullRequests(
    repoId: string,
    state?: string,
  ): Promise<GitHubPRDTO[]> {
    let query = this.supabase
      .from("github_pull_requests")
      .select("*")
      .order("opened_at", { ascending: false })
      .limit(100);
    if (repoId) query = query.eq("repo_id", repoId);
    if (state) query = query.eq("state", state);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(this.mapPR);
  }

  async listIssues(repoId: string, state?: string): Promise<GitHubIssueDTO[]> {
    let query = this.supabase
      .from("github_issues")
      .select("*")
      .order("opened_at", { ascending: false })
      .limit(100);
    if (repoId) query = query.eq("repo_id", repoId);
    if (state) query = query.eq("state", state);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(this.mapIssue);
  }

  async listSecurityAlerts(
    _tenantId: string,
    severity?: string,
  ): Promise<GitHubAlertDTO[]> {
    let query = this.supabase
      .from("github_security_alerts")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(100);
    if (severity) query = query.eq("severity", severity);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(this.mapAlert);
  }

  async getLatestSnapshot(
    _tenantId: string,
  ): Promise<GitHubSnapshotDTO | null> {
    const { data, error } = await this.supabase
      .from("github_governance_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapSnapshot(data);
  }

  async listSnapshots(
    _tenantId: string,
    limit = 30,
  ): Promise<GitHubSnapshotDTO[]> {
    const { data, error } = await this.supabase
      .from("github_governance_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(this.mapSnapshot);
  }

  async listGovernanceEvents(
    _tenantId: string,
    limit = 50,
  ): Promise<GitHubEventDTO[]> {
    const { data, error } = await this.supabase
      .from("github_governance_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(this.mapEvent);
  }

  // ─── Mappers (snake_case → camelCase) ─────────────────

  private mapOrg = (row: any): GitHubOrgDTO => ({
    id: row.id,
    tenantId: row.tenant_id,
    login: row.login,
    name: row.name,
    avatarUrl: row.avatar_url,
    membersCount: row.members_count ?? 0,
    reposCount: row.repos_count ?? 0,
    syncedAt: row.synced_at,
  });

  private mapRepo = (row: any): GitHubRepoDTO => ({
    id: row.id,
    tenantId: row.tenant_id,
    orgId: row.org_id,
    fullName: row.full_name,
    name: row.name,
    isPrivate: row.is_private,
    hasBranchProtection: row.has_branch_protection,
    openVulnerabilitiesCount: row.open_vulnerabilities_count ?? 0,
    openIssuesCount: row.open_issues_count ?? 0,
    openPrsCount: row.open_prs_count ?? 0,
    healthScore: row.health_score ?? 0,
    language: row.language,
  });

  private mapPR = (row: any): GitHubPRDTO => ({
    id: row.id,
    repoId: row.repo_id,
    githubPrNumber: row.github_pr_number,
    title: row.title,
    state: row.state,
    author: row.author,
    reviewCount: row.review_count ?? 0,
    mergedByAdmin: row.merged_by_admin ?? false,
    openedAt: row.opened_at,
    mergedAt: row.merged_at,
  });

  private mapIssue = (row: any): GitHubIssueDTO => ({
    id: row.id,
    repoId: row.repo_id,
    githubIssueNumber: row.github_issue_number,
    title: row.title,
    state: row.state,
    author: row.author,
    isCritical: row.is_critical ?? false,
    slaBreached: row.sla_breached ?? false,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
  });

  private mapAlert = (row: any): GitHubAlertDTO => ({
    id: row.id,
    repoId: row.repo_id,
    alertType: row.alert_type,
    severity: row.severity,
    state: row.state,
    packageName: row.package_name,
    cveId: row.cve_id,
    summary: row.summary,
    detectedAt: row.detected_at,
  });

  private mapSnapshot = (row: any): GitHubSnapshotDTO => ({
    id: row.id,
    snapshotDate: row.snapshot_date,
    totalRepos: row.total_repos ?? 0,
    reposWithProtection: row.repos_with_protection ?? 0,
    openVulnerabilities: row.open_vulnerabilities ?? 0,
    criticalVulnerabilities: row.critical_vulnerabilities ?? 0,
    governanceScore: row.governance_score ?? 0,
  });

  private mapEvent = (row: any): GitHubEventDTO => ({
    id: row.id,
    eventType: row.event_type,
    action: row.action,
    severity: row.severity,
    sourceRepo: row.source_repo,
    sourceActor: row.source_actor,
    summary: row.summary,
    createdAt: row.created_at,
  });
}
