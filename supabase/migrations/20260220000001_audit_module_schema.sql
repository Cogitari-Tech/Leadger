-- ==========================================================
-- Migration: Audit Module Schema
-- Creates all audit tables with tenant isolation and RLS
-- ==========================================================

-- ============================================================
-- 0. PREREQUISITES: tenants + tenant_members (multi-tenant infra)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS tenant_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,
    role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','auditor','member','viewer')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tm_user ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tm_tenant ON tenant_members(tenant_id);

DROP POLICY IF EXISTS "tenants_select" ON tenants;
CREATE POLICY "tenants_select" ON tenants
    FOR SELECT TO authenticated
    USING (id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid()));

DROP POLICY IF EXISTS "tenants_all_service" ON tenants;
CREATE POLICY "tenants_all_service" ON tenants
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tm_select" ON tenant_members;
CREATE POLICY "tm_select" ON tenant_members
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR tenant_id IN (
        SELECT tm2.tenant_id FROM tenant_members tm2 WHERE tm2.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "tm_all_service" ON tenant_members;
CREATE POLICY "tm_all_service" ON tenant_members
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
-- ============================================================
-- 1. audit_frameworks — Reference frameworks (LGPD, GDPR, ISO)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_frameworks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    version     TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_frameworks_tenant ON audit_frameworks(tenant_id);

ALTER TABLE audit_frameworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_frameworks_select" ON audit_frameworks;
CREATE POLICY "audit_frameworks_select" ON audit_frameworks
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        OR tenant_id IS NULL
    );

DROP POLICY IF EXISTS "audit_frameworks_insert" ON audit_frameworks;
CREATE POLICY "audit_frameworks_insert" ON audit_frameworks
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "audit_frameworks_update" ON audit_frameworks;
CREATE POLICY "audit_frameworks_update" ON audit_frameworks
    FOR UPDATE TO authenticated
    USING (
        tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        AND is_system = false
    );

DROP POLICY IF EXISTS "audit_frameworks_delete" ON audit_frameworks;
CREATE POLICY "audit_frameworks_delete" ON audit_frameworks
    FOR DELETE TO authenticated
    USING (
        tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        AND is_system = false
    );

-- ============================================================
-- 2. audit_framework_controls — Controls within a framework
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_framework_controls (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id  UUID NOT NULL REFERENCES audit_frameworks(id) ON DELETE CASCADE,
    code          TEXT NOT NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    category      TEXT,
    sort_order    INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_afc_framework ON audit_framework_controls(framework_id);

ALTER TABLE audit_framework_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "afc_select" ON audit_framework_controls;
CREATE POLICY "afc_select" ON audit_framework_controls
    FOR SELECT TO authenticated
    USING (
        framework_id IN (
            SELECT id FROM audit_frameworks
            WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
               OR tenant_id IS NULL
        )
    );

DROP POLICY IF EXISTS "afc_insert" ON audit_framework_controls;
CREATE POLICY "afc_insert" ON audit_framework_controls
    FOR INSERT TO authenticated
    WITH CHECK (
        framework_id IN (
            SELECT id FROM audit_frameworks
            WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
              AND is_system = false
        )
    );

DROP POLICY IF EXISTS "afc_update" ON audit_framework_controls;
CREATE POLICY "afc_update" ON audit_framework_controls
    FOR UPDATE TO authenticated
    USING (
        framework_id IN (
            SELECT id FROM audit_frameworks
            WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
              AND is_system = false
        )
    );

DROP POLICY IF EXISTS "afc_delete" ON audit_framework_controls;
CREATE POLICY "afc_delete" ON audit_framework_controls
    FOR DELETE TO authenticated
    USING (
        framework_id IN (
            SELECT id FROM audit_frameworks
            WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
              AND is_system = false
        )
    );

-- ============================================================
-- 3. audit_programs — Audit cycles
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_programs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    framework_id    UUID REFERENCES audit_frameworks(id) ON DELETE SET NULL,
    frequency       TEXT NOT NULL CHECK (frequency IN ('annual','semi_annual','quarterly','monthly','biweekly','weekly')),
    status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','cancelled')),
    start_date      DATE,
    end_date        DATE,
    responsible_id  UUID,
    created_by      UUID NOT NULL DEFAULT auth.uid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_programs_tenant ON audit_programs(tenant_id);
CREATE INDEX idx_audit_programs_framework ON audit_programs(framework_id);
CREATE INDEX idx_audit_programs_status ON audit_programs(status);

ALTER TABLE audit_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ap_select" ON audit_programs;
CREATE POLICY "ap_select" ON audit_programs
    FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid()));

DROP POLICY IF EXISTS "ap_insert" ON audit_programs;
CREATE POLICY "ap_insert" ON audit_programs
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid()));

DROP POLICY IF EXISTS "ap_update" ON audit_programs;
CREATE POLICY "ap_update" ON audit_programs
    FOR UPDATE TO authenticated
    USING (tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid()));

DROP POLICY IF EXISTS "ap_delete" ON audit_programs;
CREATE POLICY "ap_delete" ON audit_programs
    FOR DELETE TO authenticated
    USING (tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid()));

-- ============================================================
-- 4. audit_program_checklists — Checklist items per program
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_program_checklists (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id    UUID NOT NULL REFERENCES audit_programs(id) ON DELETE CASCADE,
    control_id    UUID REFERENCES audit_framework_controls(id) ON DELETE SET NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','compliant','non_compliant','not_applicable')),
    notes         TEXT,
    checked_by    UUID,
    checked_at    TIMESTAMPTZ,
    sort_order    INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_apc_program ON audit_program_checklists(program_id);
CREATE INDEX idx_apc_control ON audit_program_checklists(control_id);

ALTER TABLE audit_program_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "apc_select" ON audit_program_checklists;
CREATE POLICY "apc_select" ON audit_program_checklists
    FOR SELECT TO authenticated
    USING (program_id IN (
        SELECT id FROM audit_programs
        WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "apc_insert" ON audit_program_checklists;
CREATE POLICY "apc_insert" ON audit_program_checklists
    FOR INSERT TO authenticated
    WITH CHECK (program_id IN (
        SELECT id FROM audit_programs
        WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "apc_update" ON audit_program_checklists;
CREATE POLICY "apc_update" ON audit_program_checklists
    FOR UPDATE TO authenticated
    USING (program_id IN (
        SELECT id FROM audit_programs
        WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "apc_delete" ON audit_program_checklists;
CREATE POLICY "apc_delete" ON audit_program_checklists
    FOR DELETE TO authenticated
    USING (program_id IN (
        SELECT id FROM audit_programs
        WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

-- ============================================================
-- 5. audit_findings — Non-conformities
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_findings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id          UUID NOT NULL REFERENCES audit_programs(id) ON DELETE CASCADE,
    checklist_item_id   UUID REFERENCES audit_program_checklists(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    description         TEXT,
    risk_level          TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('critical','high','medium','low')),
    status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','accepted')),
    due_date            DATE,
    assigned_to         UUID,
    created_by          UUID NOT NULL DEFAULT auth.uid(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at         TIMESTAMPTZ
);

CREATE INDEX idx_af_program ON audit_findings(program_id);
CREATE INDEX idx_af_risk ON audit_findings(risk_level);
CREATE INDEX idx_af_status ON audit_findings(status);

ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "af_select" ON audit_findings;
CREATE POLICY "af_select" ON audit_findings
    FOR SELECT TO authenticated
    USING (program_id IN (
        SELECT id FROM audit_programs
        WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "af_insert" ON audit_findings;
CREATE POLICY "af_insert" ON audit_findings
    FOR INSERT TO authenticated
    WITH CHECK (program_id IN (
        SELECT id FROM audit_programs
        WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "af_update" ON audit_findings;
CREATE POLICY "af_update" ON audit_findings
    FOR UPDATE TO authenticated
    USING (program_id IN (
        SELECT id FROM audit_programs
        WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "af_delete" ON audit_findings;
CREATE POLICY "af_delete" ON audit_findings
    FOR DELETE TO authenticated
    USING (program_id IN (
        SELECT id FROM audit_programs
        WHERE tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

-- ============================================================
-- 6. audit_evidences — Supporting documents and logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_evidences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id          UUID REFERENCES audit_findings(id) ON DELETE CASCADE,
    checklist_item_id   UUID REFERENCES audit_program_checklists(id) ON DELETE CASCADE,
    type                TEXT NOT NULL DEFAULT 'document' CHECK (type IN ('document','screenshot','log','link')),
    title               TEXT NOT NULL,
    description         TEXT,
    url                 TEXT,
    uploaded_by         UUID NOT NULL DEFAULT auth.uid(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT evidence_has_parent CHECK (finding_id IS NOT NULL OR checklist_item_id IS NOT NULL)
);

CREATE INDEX idx_ae_finding ON audit_evidences(finding_id);
CREATE INDEX idx_ae_checklist ON audit_evidences(checklist_item_id);

ALTER TABLE audit_evidences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ae_select" ON audit_evidences;
CREATE POLICY "ae_select" ON audit_evidences
    FOR SELECT TO authenticated
    USING (
        (finding_id IS NOT NULL AND finding_id IN (
            SELECT af.id FROM audit_findings af
            JOIN audit_programs ap ON af.program_id = ap.id
            WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        ))
        OR
        (checklist_item_id IS NOT NULL AND checklist_item_id IN (
            SELECT apc.id FROM audit_program_checklists apc
            JOIN audit_programs ap ON apc.program_id = ap.id
            WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "ae_insert" ON audit_evidences;
CREATE POLICY "ae_insert" ON audit_evidences
    FOR INSERT TO authenticated
    WITH CHECK (
        (finding_id IS NOT NULL AND finding_id IN (
            SELECT af.id FROM audit_findings af
            JOIN audit_programs ap ON af.program_id = ap.id
            WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        ))
        OR
        (checklist_item_id IS NOT NULL AND checklist_item_id IN (
            SELECT apc.id FROM audit_program_checklists apc
            JOIN audit_programs ap ON apc.program_id = ap.id
            WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "ae_update" ON audit_evidences;
CREATE POLICY "ae_update" ON audit_evidences
    FOR UPDATE TO authenticated
    USING (
        (finding_id IS NOT NULL AND finding_id IN (
            SELECT af.id FROM audit_findings af
            JOIN audit_programs ap ON af.program_id = ap.id
            WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        ))
        OR
        (checklist_item_id IS NOT NULL AND checklist_item_id IN (
            SELECT apc.id FROM audit_program_checklists apc
            JOIN audit_programs ap ON apc.program_id = ap.id
            WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "ae_delete" ON audit_evidences;
CREATE POLICY "ae_delete" ON audit_evidences
    FOR DELETE TO authenticated
    USING (
        (finding_id IS NOT NULL AND finding_id IN (
            SELECT af.id FROM audit_findings af
            JOIN audit_programs ap ON af.program_id = ap.id
            WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        ))
        OR
        (checklist_item_id IS NOT NULL AND checklist_item_id IN (
            SELECT apc.id FROM audit_program_checklists apc
            JOIN audit_programs ap ON apc.program_id = ap.id
            WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
        ))
    );

-- ============================================================
-- 7. audit_action_plans — Corrective actions for findings
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_action_plans (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id    UUID NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','overdue')),
    priority      TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
    assigned_to   UUID,
    due_date      DATE,
    completed_at  TIMESTAMPTZ,
    created_by    UUID NOT NULL DEFAULT auth.uid(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aap_finding ON audit_action_plans(finding_id);
CREATE INDEX idx_aap_status ON audit_action_plans(status);

ALTER TABLE audit_action_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aap_select" ON audit_action_plans;
CREATE POLICY "aap_select" ON audit_action_plans
    FOR SELECT TO authenticated
    USING (finding_id IN (
        SELECT af.id FROM audit_findings af
        JOIN audit_programs ap ON af.program_id = ap.id
        WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "aap_insert" ON audit_action_plans;
CREATE POLICY "aap_insert" ON audit_action_plans
    FOR INSERT TO authenticated
    WITH CHECK (finding_id IN (
        SELECT af.id FROM audit_findings af
        JOIN audit_programs ap ON af.program_id = ap.id
        WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "aap_update" ON audit_action_plans;
CREATE POLICY "aap_update" ON audit_action_plans
    FOR UPDATE TO authenticated
    USING (finding_id IN (
        SELECT af.id FROM audit_findings af
        JOIN audit_programs ap ON af.program_id = ap.id
        WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

DROP POLICY IF EXISTS "aap_delete" ON audit_action_plans;
CREATE POLICY "aap_delete" ON audit_action_plans
    FOR DELETE TO authenticated
    USING (finding_id IN (
        SELECT af.id FROM audit_findings af
        JOIN audit_programs ap ON af.program_id = ap.id
        WHERE ap.tenant_id IN (SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid())
    ));

-- ============================================================
-- Updated_at trigger for audit_programs
-- ============================================================
CREATE OR REPLACE FUNCTION update_audit_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_audit_programs_updated_at ON audit_programs;
CREATE TRIGGER trg_audit_programs_updated_at
    BEFORE UPDATE ON audit_programs
    FOR EACH ROW EXECUTE FUNCTION update_audit_programs_updated_at();
