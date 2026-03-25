-- GitHub Governance Module — Migration for Production
-- Tables, RLS Policies, and Indexes

-- 1. github_installations
CREATE TABLE IF NOT EXISTS public.github_installations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  installation_id bigint NOT NULL,
  github_org_id bigint NOT NULL,
  account_login text NOT NULL,
  account_type text DEFAULT 'Organization',
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'removed')),
  permissions jsonb DEFAULT '{}',
  events jsonb DEFAULT '[]',
  installed_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_installation UNIQUE (installation_id),
  CONSTRAINT unique_github_org UNIQUE (github_org_id)
);

ALTER TABLE public.github_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.github_installations
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
CREATE POLICY "service_role_all" ON public.github_installations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. github_organizations
CREATE TABLE IF NOT EXISTS public.github_organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  github_org_id bigint NOT NULL,
  login text NOT NULL,
  name text,
  avatar_url text,
  description text,
  members_count int DEFAULT 0,
  repos_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE public.github_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.github_organizations
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
CREATE POLICY "service_role_all" ON public.github_organizations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. github_repositories
CREATE TABLE IF NOT EXISTS public.github_repositories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  github_repo_id bigint NOT NULL,
  org_id uuid REFERENCES public.github_organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  full_name text NOT NULL,
  visibility text DEFAULT 'private',
  default_branch text DEFAULT 'main',
  has_branch_protection boolean DEFAULT false,
  open_vulnerabilities_count int DEFAULT 0,
  health_score int DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  language text,
  topics jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.github_repositories
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
CREATE POLICY "service_role_all" ON public.github_repositories
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. github_pull_requests
CREATE TABLE IF NOT EXISTS public.github_pull_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_id uuid NOT NULL REFERENCES public.github_repositories(id) ON DELETE CASCADE,
  github_pr_number int NOT NULL,
  title text NOT NULL,
  state text DEFAULT 'open' CHECK (state IN ('open', 'closed', 'merged')),
  author text,
  review_count int DEFAULT 0,
  merged_by_admin boolean DEFAULT false,
  time_to_merge_hours numeric,
  has_ci_passed boolean,
  additions int DEFAULT 0,
  deletions int DEFAULT 0,
  files_changed int DEFAULT 0,
  linked_finding_id uuid,
  opened_at timestamptz DEFAULT now(),
  merged_at timestamptz,
  closed_at timestamptz,
  url text
);

ALTER TABLE public.github_pull_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.github_pull_requests
  FOR ALL USING (
    repo_id IN (SELECT id FROM public.github_repositories WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  );
CREATE POLICY "service_role_all" ON public.github_pull_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. github_issues
CREATE TABLE IF NOT EXISTS public.github_issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_id uuid NOT NULL REFERENCES public.github_repositories(id) ON DELETE CASCADE,
  github_issue_number int NOT NULL,
  title text NOT NULL,
  state text DEFAULT 'open' CHECK (state IN ('open', 'closed')),
  author text,
  labels jsonb DEFAULT '[]',
  is_critical boolean DEFAULT false,
  sla_breached boolean DEFAULT false,
  linked_finding_id uuid,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  url text
);

ALTER TABLE public.github_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.github_issues
  FOR ALL USING (
    repo_id IN (SELECT id FROM public.github_repositories WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  );
CREATE POLICY "service_role_all" ON public.github_issues
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. github_security_alerts
CREATE TABLE IF NOT EXISTS public.github_security_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_id uuid NOT NULL REFERENCES public.github_repositories(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('dependabot', 'code_scanning', 'secret_scanning')),
  severity text DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  state text DEFAULT 'open' CHECK (state IN ('open', 'dismissed', 'fixed', 'auto_dismissed')),
  title text,
  description text,
  package_name text,
  vulnerable_version text,
  patched_version text,
  linked_finding_id uuid,
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  url text
);

ALTER TABLE public.github_security_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.github_security_alerts
  FOR ALL USING (
    repo_id IN (SELECT id FROM public.github_repositories WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  );
CREATE POLICY "service_role_all" ON public.github_security_alerts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. github_governance_events (IMMUTABLE audit trail)
CREATE TABLE IF NOT EXISTS public.github_governance_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  source text,
  description text,
  raw_payload jsonb DEFAULT '{}',
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.github_governance_events ENABLE ROW LEVEL SECURITY;
-- Read-only for authenticated (immutable events)
CREATE POLICY "tenant_read" ON public.github_governance_events
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
CREATE POLICY "service_role_all" ON public.github_governance_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. github_governance_snapshots
CREATE TABLE IF NOT EXISTS public.github_governance_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  total_repos int DEFAULT 0,
  repos_with_protection int DEFAULT 0,
  open_vulnerabilities int DEFAULT 0,
  critical_alerts int DEFAULT 0,
  prs_without_review int DEFAULT 0,
  avg_time_to_merge_hours numeric DEFAULT 0,
  governance_score int DEFAULT 50 CHECK (governance_score >= 0 AND governance_score <= 100),
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.github_governance_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.github_governance_snapshots
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
CREATE POLICY "service_role_all" ON public.github_governance_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gh_installations_tenant ON public.github_installations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gh_orgs_tenant ON public.github_organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gh_repos_tenant ON public.github_repositories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gh_repos_health ON public.github_repositories(health_score);
CREATE INDEX IF NOT EXISTS idx_gh_prs_repo ON public.github_pull_requests(repo_id);
CREATE INDEX IF NOT EXISTS idx_gh_issues_repo ON public.github_issues(repo_id);
CREATE INDEX IF NOT EXISTS idx_gh_alerts_repo ON public.github_security_alerts(repo_id);
CREATE INDEX IF NOT EXISTS idx_gh_events_tenant ON public.github_governance_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gh_events_processed ON public.github_governance_events(processed);
CREATE INDEX IF NOT EXISTS idx_gh_snapshots_tenant ON public.github_governance_snapshots(tenant_id);
