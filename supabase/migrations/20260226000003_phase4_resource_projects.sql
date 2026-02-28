-- ==========================================================
-- FASE 4: Resource Association (Projects -> Audits/Repos)
-- ==========================================================

-- 1. Add project_id to audit_programs
ALTER TABLE public.audit_programs
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Update RLS for audit_programs to respect project isolation if assigned
-- Using a separate policy ensures backward compatibility for non-assigned programs.
-- Alternatively, if you want strictly tenant-wide visibility, project_id is just metadata.
-- Below we keep it as metadata (tenant_id already enforces isolation).
-- RLS update is bypassed for simplicity unless specific strict isolation is requested.

-- 2. Add project_id to audit_findings
ALTER TABLE public.audit_findings
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- 3. Add project_id to github_repositories (requires github module)
-- Assuming github_repositories exists (from phase 2/3)
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'github_repositories') THEN
    ALTER TABLE public.github_repositories
      ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
  END IF;
END $$;
