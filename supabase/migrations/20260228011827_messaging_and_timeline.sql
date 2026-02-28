-- Migration: Phase 8 - Messaging, Notifications and Audit Activity Log

-- ==========================================
-- 1. Notifications Table
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    channel TEXT NOT NULL DEFAULT 'in-app',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
    ON notifications FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
    ON notifications FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==========================================
-- 2. Audit Activity Log Table
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES audit_programs(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_activity_log_audit_id ON audit_activity_log(audit_id);
CREATE INDEX idx_audit_activity_log_tenant_id ON audit_activity_log(tenant_id);

ALTER TABLE audit_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view audit activity within their tenant"
    ON audit_activity_log FOR SELECT TO authenticated
    USING (
        tenant_id IN (
            SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = auth.uid()
        )
    );

-- ==========================================
-- 3. RPC Functions for Audit Workflow
-- ==========================================

-- 3.1. Submit for review
CREATE OR REPLACE FUNCTION submit_audit_for_review(p_audit_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_performer UUID := auth.uid();
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM audit_programs WHERE id = p_audit_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Audit not found';
    END IF;

    -- Update status
    UPDATE audit_programs
    SET status = 'under_review', updated_at = now()
    WHERE id = p_audit_id;

    -- Log Activity
    IF EXISTS (SELECT 1 FROM audit_activity_log WHERE audit_id = p_audit_id AND action = 'Returned with feedback') THEN
        INSERT INTO audit_activity_log (tenant_id, audit_id, action, performed_by, metadata_json)
        VALUES (v_tenant_id, p_audit_id, 'Resubmitted', v_performer, '{}'::jsonb);
    ELSE
        INSERT INTO audit_activity_log (tenant_id, audit_id, action, performed_by, metadata_json)
        VALUES (v_tenant_id, p_audit_id, 'Submitted for review', v_performer, '{}'::jsonb);
    END IF;
END;
$$;

-- 3.2. Reject with feedback
CREATE OR REPLACE FUNCTION reject_audit_with_feedback(p_audit_id UUID, p_feedback TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_created_by UUID;
    v_audit_name TEXT;
    v_performer UUID := auth.uid();
BEGIN
    -- 1. Get audit info
    SELECT tenant_id, created_by, name INTO v_tenant_id, v_created_by, v_audit_name
    FROM audit_programs
    WHERE id = p_audit_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Audit not found';
    END IF;

    -- 2. Update audit status
    UPDATE audit_programs
    SET status = 'in_progress', updated_at = now()
    WHERE id = p_audit_id;

    -- 3. Log activity
    INSERT INTO audit_activity_log (tenant_id, audit_id, action, performed_by, metadata_json)
    VALUES (v_tenant_id, p_audit_id, 'Returned with feedback', v_performer, json_build_object('feedback', p_feedback)::jsonb);

    -- 4. Notify creator if they are not the performer
    IF v_created_by != v_performer THEN
        INSERT INTO notifications (tenant_id, user_id, event_type, reference_type, reference_id, title, message)
        VALUES (
            v_tenant_id, 
            v_created_by, 
            'audit_returned', 
            'audit', 
            p_audit_id, 
            'Auditoria Devolvida', 
            'Sua auditoria "' || v_audit_name || '" foi devolvida com feedback: ' || p_feedback
        );
    END IF;
END;
$$;

-- 3.3. Approve audit
CREATE OR REPLACE FUNCTION approve_audit(p_audit_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_created_by UUID;
    v_audit_name TEXT;
    v_performer UUID := auth.uid();
BEGIN
    -- 1. Get audit info
    SELECT tenant_id, created_by, name INTO v_tenant_id, v_created_by, v_audit_name
    FROM audit_programs
    WHERE id = p_audit_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Audit not found';
    END IF;

    -- 2. Update audit status
    UPDATE audit_programs
    SET status = 'approved', updated_at = now()
    WHERE id = p_audit_id;

    -- 3. Log activity
    INSERT INTO audit_activity_log (tenant_id, audit_id, action, performed_by, metadata_json)
    VALUES (v_tenant_id, p_audit_id, 'Approved', v_performer, '{}'::jsonb);

    -- 4. Notify creator
    IF v_created_by != v_performer THEN
        INSERT INTO notifications (tenant_id, user_id, event_type, reference_type, reference_id, title, message)
        VALUES (
            v_tenant_id, 
            v_created_by, 
            'audit_approved', 
            'audit', 
            p_audit_id, 
            'Auditoria Aprovada', 
            'Sua auditoria "' || v_audit_name || '" foi aprovada com sucesso.'
        );
    END IF;
END;
$$;
