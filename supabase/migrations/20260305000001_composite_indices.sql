-- Migration: Add composite indices for frequently filtered columns
-- These indices optimize the most common query patterns in the application

-- AuthContext: loadUserProfile queries tenant_members by (user_id, status)
CREATE INDEX IF NOT EXISTS idx_tm_user_status ON public.tenant_members(user_id, status);

-- NotificationBell: useNotifications filters by (user_id, is_read)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- Finance hooks: transactions frequently filtered by (tenant_id, date) range
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON public.transactions(tenant_id, date);

-- Audit findings: frequently filtered by (status, risk_level) for dashboard KPIs
CREATE INDEX IF NOT EXISTS idx_af_status_risk ON public.audit_findings(status, risk_level);
