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

  private mapOrg = (row: Record<string, unknown>): GitHubOrgDTO => ({
    id: row.id as string,
    tenantId: row.tenant_id as string,
    login: row.login as string,
    name: (row.name as string) || null,
    avatarUrl: (row.avatar_url as string) || null,
    membersCount: (row.members_count as number) ?? 0,
    reposCount: (row.repos_count as number) ?? 0,
    syncedAt: (row.synced_at as string) || null,
  });

  private mapRepo = (row: Record<string, unknown>): GitHubRepoDTO => ({
    id: row.id as string,
    tenantId: row.tenant_id as string,
    orgId: row.org_id as string,
    fullName: row.full_name as string,
    name: row.name as string,
    isPrivate: row.is_private as boolean,
    hasBranchProtection: row.has_branch_protection as boolean,
    openVulnerabilitiesCount: (row.open_vulnerabilities_count as number) ?? 0,
    openIssuesCount: (row.open_issues_count as number) ?? 0,
    openPrsCount: (row.open_prs_count as number) ?? 0,
    healthScore: (row.health_score as number) ?? 0,
    language: (row.language as string) || null,
  });

  private mapPR = (row: Record<string, unknown>): GitHubPRDTO => ({
    id: row.id as string,
    repoId: row.repo_id as string,
    githubPrNumber: row.github_pr_number as number,
    title: row.title as string,
    state: row.state as string,
    author: row.author as string,
    reviewCount: (row.review_count as number) ?? 0,
    mergedByAdmin: (row.merged_by_admin as boolean) ?? false,
    openedAt: row.opened_at as string,
    mergedAt: (row.merged_at as string) || null,
  });

  private mapIssue = (row: Record<string, unknown>): GitHubIssueDTO => ({
    id: row.id as string,
    repoId: row.repo_id as string,
    githubIssueNumber: row.github_issue_number as number,
    title: row.title as string,
    state: row.state as string,
    author: row.author as string,
    isCritical: (row.is_critical as boolean) ?? false,
    slaBreached: (row.sla_breached as boolean) ?? false,
    openedAt: row.opened_at as string,
    closedAt: (row.closed_at as string) || null,
  });

  private mapAlert = (row: Record<string, unknown>): GitHubAlertDTO => ({
    id: row.id as string,
    repoId: row.repo_id as string,
    alertType: row.alert_type as string,
    severity: row.severity as string,
    state: row.state as string,
    packageName: row.package_name as string,
    cveId: (row.cve_id as string) || null,
    summary: (row.summary as string) || null,
    detectedAt: row.detected_at as string,
  });

  private mapSnapshot = (row: Record<string, unknown>): GitHubSnapshotDTO => ({
    id: row.id as string,
    snapshotDate: row.snapshot_date as string,
    totalRepos: (row.total_repos as number) ?? 0,
    reposWithProtection: (row.repos_with_protection as number) ?? 0,
    openVulnerabilities: (row.open_vulnerabilities as number) ?? 0,
    criticalVulnerabilities: (row.critical_vulnerabilities as number) ?? 0,
    governanceScore: (row.governance_score as number) ?? 0,
  });

  private mapEvent = (row: Record<string, unknown>): GitHubEventDTO => ({
    id: row.id as string,
    eventType: row.event_type as string,
    action: row.action as string,
    severity: (row.severity as string) || null,
    sourceRepo: (row.source_repo as string) || null,
    sourceActor: row.source_actor as string,
    summary: (row.summary as string) || null,
    createdAt: row.created_at as string,
  });
}
