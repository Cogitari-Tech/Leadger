// packages/core/src/repositories/IGitHubRepository.ts

/**
 * Port: GitHub Repository Interface
 *
 * Defines the contract for GitHub governance data access.
 * Implementations can use Supabase, GitHub API, or any other source.
 */
export interface IGitHubRepository {
  // Organizations
  listOrganizations(tenantId: string): Promise<GitHubOrgDTO[]>;
  getOrganizationById(id: string): Promise<GitHubOrgDTO | null>;

  // Repositories
  listRepositories(tenantId: string, orgId?: string): Promise<GitHubRepoDTO[]>;
  getRepositoryById(id: string): Promise<GitHubRepoDTO | null>;

  // Pull Requests
  listPullRequests(repoId: string, state?: string): Promise<GitHubPRDTO[]>;

  // Issues
  listIssues(repoId: string, state?: string): Promise<GitHubIssueDTO[]>;

  // Security Alerts
  listSecurityAlerts(
    tenantId: string,
    severity?: string,
  ): Promise<GitHubAlertDTO[]>;

  // Governance Snapshots
  getLatestSnapshot(tenantId: string): Promise<GitHubSnapshotDTO | null>;
  listSnapshots(tenantId: string, limit?: number): Promise<GitHubSnapshotDTO[]>;

  // Events
  listGovernanceEvents(
    tenantId: string,
    limit?: number,
  ): Promise<GitHubEventDTO[]>;
}

// ─── DTOs ─────────────────────────────────────────────────

export interface GitHubOrgDTO {
  id: string;
  tenantId: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
  membersCount: number;
  reposCount: number;
  syncedAt: string | null;
}

export interface GitHubRepoDTO {
  id: string;
  tenantId: string;
  orgId: string;
  fullName: string;
  name: string;
  isPrivate: boolean;
  hasBranchProtection: boolean;
  openVulnerabilitiesCount: number;
  openIssuesCount: number;
  openPrsCount: number;
  healthScore: number;
  language: string | null;
}

export interface GitHubPRDTO {
  id: string;
  repoId: string;
  githubPrNumber: number;
  title: string;
  state: string;
  author: string;
  reviewCount: number;
  mergedByAdmin: boolean;
  openedAt: string;
  mergedAt: string | null;
}

export interface GitHubIssueDTO {
  id: string;
  repoId: string;
  githubIssueNumber: number;
  title: string;
  state: string;
  author: string;
  isCritical: boolean;
  slaBreached: boolean;
  openedAt: string;
  closedAt: string | null;
}

export interface GitHubAlertDTO {
  id: string;
  repoId: string;
  alertType: string;
  severity: string;
  state: string;
  packageName: string | null;
  cveId: string | null;
  summary: string | null;
  detectedAt: string;
}

export interface GitHubSnapshotDTO {
  id: string;
  snapshotDate: string;
  totalRepos: number;
  reposWithProtection: number;
  openVulnerabilities: number;
  criticalVulnerabilities: number;
  governanceScore: number;
}

export interface GitHubEventDTO {
  id: string;
  eventType: string;
  action: string | null;
  severity: string | null;
  sourceRepo: string | null;
  sourceActor: string | null;
  summary: string | null;
  createdAt: string;
}
