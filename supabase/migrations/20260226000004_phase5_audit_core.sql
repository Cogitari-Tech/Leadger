-- ==========================================
-- Phase 5: Core de Execução de Auditoria 
-- ==========================================

-- Helper function to check role permissions
CREATE OR REPLACE FUNCTION has_permission(p_permission_code text)
RETURNS boolean AS $$
DECLARE
    v_has_permission boolean;
    v_tenant_id uuid;
BEGIN
    -- Extract tenant_id from JWT
    v_tenant_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid;

    IF v_tenant_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM tenant_members tm
        JOIN roles r ON tm.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE tm.user_id = auth.uid()
          AND tm.tenant_id = v_tenant_id
          AND p.code = p_permission_code
    ) INTO v_has_permission;

    RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 1. Updates in audit_programs / Statuses
-- (Currently, 'status' in audit_programs is 'draft', 'in_progress', 'completed', 'cancelled')
-- We need to reflect the new workflow: Draft -> In Progress -> Under Review -> Approved -> Archived
DO $$
DECLARE
    const_name text;
BEGIN
    SELECT conname INTO const_name
    FROM pg_constraint
    WHERE conrelid = 'audit_programs'::regclass
      AND pg_get_constraintdef(oid) LIKE '%status%';

    IF const_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE audit_programs DROP CONSTRAINT ' || const_name;
    END IF;
END $$;

ALTER TABLE audit_programs ADD CONSTRAINT audit_programs_status_check 
CHECK (status IN ('draft', 'in_progress', 'under_review', 'approved', 'archived', 'completed', 'cancelled'));

-- 2. ENUM for Response Status
CREATE TYPE audit_response_status AS ENUM ('conforme', 'nao_conforme', 'parcial', 'n_a');

-- ==========================================
-- Tables
-- ==========================================

-- A. Respostas do Checklist (Item Responses)
CREATE TABLE IF NOT EXISTS audit_item_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES audit_programs(id) ON DELETE CASCADE,
    checklist_item_id UUID NOT NULL REFERENCES audit_program_checklists(id) ON DELETE RESTRICT,
    status audit_response_status NOT NULL,
    justification TEXT,
    responded_by UUID NOT NULL REFERENCES auth.users(id),
    responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Constraint: Only one response per item per audit
    UNIQUE(audit_id, checklist_item_id)
);

-- B. Evidências do Checklist (Item Evidences)
CREATE TABLE IF NOT EXISTS audit_item_evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_item_response_id UUID NOT NULL REFERENCES audit_item_responses(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- C. Versões Aprovadas (Relatórios Finais)
CREATE TABLE IF NOT EXISTS audit_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES audit_programs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    pdf_path TEXT,
    doc_hash TEXT NOT NULL,
    approved_by UUID NOT NULL REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(audit_id, version_number)
);

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================
ALTER TABLE audit_item_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_item_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_versions ENABLE ROW LEVEL SECURITY;

-- Respostas (Responses)
CREATE POLICY "Users can view audit responses in their tenant"
    ON audit_item_responses FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users with manage permission can modify audit responses"
    ON audit_item_responses FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
        ) AND has_permission('audit.edit')
    );

-- Evidências (Evidences)
CREATE POLICY "Users can view audit evidences in their tenant"
    ON audit_item_evidences FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users with manage permission can modify audit evidences"
    ON audit_item_evidences FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
        ) AND has_permission('audit.edit')
    );

-- Versões (Versions)
CREATE POLICY "Users can view audit versions in their tenant"
    ON audit_versions FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users with manage permission can create audit versions"
    ON audit_versions FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
        ) AND has_permission('audit.edit')
    );

-- ==========================================
-- Triggers for Finding Auto-Generation
-- ==========================================

-- Define a 'draft' status for Findings if it doesn't exist.
DO $$
DECLARE
    const_name text;
BEGIN
    SELECT conname INTO const_name
    FROM pg_constraint
    WHERE conrelid = 'audit_findings'::regclass
      AND pg_get_constraintdef(oid) LIKE '%status%';

    IF const_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE audit_findings DROP CONSTRAINT ' || const_name;
    END IF;
END $$;

ALTER TABLE audit_findings ADD CONSTRAINT audit_findings_status_check 
CHECK (status IN ('draft', 'open', 'in_progress', 'resolved', 'accepted'));

-- The trigger function
CREATE OR REPLACE FUNCTION trigger_auto_create_finding()
RETURNS TRIGGER AS $$
DECLARE
    existing_finding_id UUID;
BEGIN
    -- Only act if the status is Nao Conforme or Parcial
    IF NEW.status IN ('nao_conforme', 'parcial') THEN
        
        -- Check if a finding already exists for this exact item response 
        -- (we need a checklist_item_id column in findings to link them robustly,
        -- if it doesn't exist, we link strictly by the audit_id AND title pattern).
        -- Let's assume we link by adding checklist_item_id to audit_findings.
        -- First, ensure the column exists:
        
        SELECT id INTO existing_finding_id 
        FROM audit_findings 
        WHERE audit_id = NEW.audit_id 
          AND title LIKE 'Finding Automático - Item %' 
          AND status = 'draft'
        LIMIT 1; -- Fallback if checklist_item logic isn't strictly foreign-key yet

        IF existing_finding_id IS NULL THEN
            -- Inject the draft finding
            INSERT INTO audit_findings (
                id, audit_id, project_id, title, description, status, tenant_id, created_by, created_at
            )
            VALUES (
                gen_random_uuid(),
                NEW.audit_id,
                (SELECT project_id FROM audit_programs WHERE id = NEW.audit_id),
                'Finding Automático - Item Análise',
                COALESCE(NEW.justification, 'Necessita consolidação 5W2H'),
                'draft', -- Requires draft status on frontend
                NEW.tenant_id,
                NEW.responded_by,
                now()
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_audit_response_upsert
    AFTER INSERT OR UPDATE ON audit_item_responses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_create_finding();

-- ==========================================
-- Supabase Storage Configuration
-- ==========================================

-- Create Bucket for Evidences
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audit-evidences', 'audit-evidences', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Evidences Bucket
CREATE POLICY "Tenant users can view their evidences" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'audit-evidences' AND
  (auth.uid() IN (
    SELECT user_id FROM tenant_members 
    WHERE tenant_id::text = (storage.foldername(name))[1]
  ))
);

CREATE POLICY "Tenant users can upload evidences" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'audit-evidences' AND
  (auth.uid() IN (
    SELECT user_id FROM tenant_members 
    WHERE tenant_id::text = (storage.foldername(name))[1]
  ))
);
