-- ==========================================================
-- Migration: Phase 7 - GitHub SecOps Integration
-- Adds source tracking to audit findings to link back to GitHub
-- ==========================================================

ALTER TABLE public.audit_findings
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'manual' CHECK (source_type IN ('manual', 'github')),
ADD COLUMN IF NOT EXISTS source_url text;

-- Keep track of existing linked findings from github_security_alerts and github_issues if necessary
-- The foreign keys are already present in github_security_alerts and github_issues pointing to audit_findings

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
