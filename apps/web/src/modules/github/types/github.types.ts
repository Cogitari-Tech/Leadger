// ─── GitHub Governance Types ─────────────────────────────────────
// Multi-tenant GitHub App integration for governance and audit

export type InstallationStatus = "active" | "suspended" | "removed";
export type PRState = "open" | "closed" | "merged";
export type IssueState = "open" | "closed";
export type AlertType = "dependabot" | "secret_scanning" | "code_scanning";
export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertState = "open" | "dismissed" | "fixed" | "auto_dismissed";
export type EventSeverity = "critical" | "high" | "medium" | "low" | "info";

// ─── Database Entities ───────────────────────────────────────────

export interface GitHubInstallation {
  id: string;
  tenant_id: string;
  installation_id: number;
  github_org_id: number;
  github_org_login: string;
  app_id: number;
  status: InstallationStatus;
  permissions: Record<string, string>;
  installed_at: string;
  updated_at: string;
}

export interface GitHubOrganization {
  id: string;
  tenant_id: string;
  installation_id: string;
  github_org_id: number;
  login: string;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  members_count: number;
  repos_count: number;
  synced_at: string | null;
  created_at: string;
}

export interface GitHubRepository {
  id: string;
  tenant_id: string;
  org_id: string;
  project_id?: string | null;
  github_repo_id: number;
  full_name: string;
  name: string;
  description: string | null;
  default_branch: string;
  is_private: boolean;
  has_branch_protection: boolean;
  open_vulnerabilities_count: number;
  open_issues_count: number;
  open_prs_count: number;
  language: string | null;
  stars_count: number;
  health_score: number;
  last_push_at: string | null;
  synced_at: string | null;
  created_at: string;
}

export interface GitHubPullRequest {
  id: string;
  tenant_id: string;
  repo_id: string;
  github_pr_number: number;
  github_pr_id: number;
  title: string;
  state: PRState;
  author: string;
  author_avatar_url: string | null;
  review_count: number;
  approved_count: number;
  changes_requested_count: number;
  merged_by: string | null;
  merged_by_admin: boolean;
  has_ci_passed: boolean | null;
  additions: number;
  deletions: number;
  files_changed: number;
  time_to_merge_hours: number | null;
  labels: string[];
  linked_finding_id: string | null;
  opened_at: string;
  merged_at: string | null;
  closed_at: string | null;
  synced_at: string;
  // Joined
  repository?: GitHubRepository;
}

export interface GitHubIssue {
  id: string;
  tenant_id: string;
  repo_id: string;
  github_issue_number: number;
  github_issue_id: number;
  title: string;
  body: string | null;
  state: IssueState;
  author: string;
  author_avatar_url: string | null;
  assignees: string[];
  labels: string[];
  is_critical: boolean;
  sla_deadline: string | null;
  sla_breached: boolean;
  linked_finding_id: string | null;
  linked_action_plan_id: string | null;
  opened_at: string;
  closed_at: string | null;
  synced_at: string;
  // Joined
  repository?: GitHubRepository;
}

export interface GitHubSecurityAlert {
  id: string;
  tenant_id: string;
  repo_id: string;
  alert_type: AlertType;
  github_alert_number: number;
  severity: AlertSeverity;
  state: AlertState;
  package_name: string | null;
  vulnerable_version: string | null;
  patched_version: string | null;
  cve_id: string | null;
  summary: string | null;
  description: string | null;
  linked_finding_id: string | null;
  detected_at: string;
  resolved_at: string | null;
  synced_at: string;
  // Joined
  repository?: GitHubRepository;
}

export interface GitHubGovernanceEvent {
  id: string;
  tenant_id: string;
  installation_id: string | null;
  event_type: string;
  action: string | null;
  severity: EventSeverity | null;
  source_repo: string | null;
  source_actor: string | null;
  summary: string | null;
  raw_payload: Record<string, unknown>;
  processed: boolean;
  processed_at: string | null;
  created_at: string;
}

export interface GitHubGovernanceSnapshot {
  id: string;
  tenant_id: string;
  snapshot_date: string;
  total_repos: number;
  repos_with_protection: number;
  open_vulnerabilities: number;
  critical_vulnerabilities: number;
  prs_without_review: number;
  prs_merged_by_admin: number;
  direct_commits_to_main: number;
  avg_time_to_merge_hours: number;
  deploy_frequency: number;
  issues_past_sla: number;
  governance_score: number;
  metrics: Record<string, unknown>;
  created_at: string;
}

// ─── Dashboard / UI Types ────────────────────────────────────────

export interface GovernanceKPIs {
  totalRepos: number;
  reposWithoutProtection: number;
  openVulnerabilities: number;
  criticalAlerts: number;
  prsWithoutReview: number;
  prsMergedByAdmin: number;
  directCommitsToMain: number;
  avgTimeToMergeHours: number;
  issuesPastSLA: number;
  governanceScore: number;
}

export interface RepoHealthCard {
  repo: GitHubRepository;
  healthScore: number;
  issues: {
    noProtection: boolean;
    openVulns: number;
    stalePRs: number;
  };
}
