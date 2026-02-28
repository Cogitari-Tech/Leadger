-- ==========================================================
-- Migration: Bank Accounts & Onboarding Support
-- Phase C: Manual bank account registration
-- ==========================================================

-- ============================================================
-- 1. CREATE bank_accounts — Manual bank registration
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  bank_code TEXT,
  agency TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type VARCHAR(20) DEFAULT 'corrente' CHECK (account_type IN ('corrente', 'poupanca', 'pagamento', 'investimento')),
  holder_name TEXT NOT NULL,
  holder_document TEXT,
  pix_key TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ba_tenant ON public.bank_accounts(tenant_id);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Tenant members can view bank accounts
DROP POLICY IF EXISTS "ba_select_members" ON public.bank_accounts;
CREATE POLICY "ba_select_members" ON public.bank_accounts
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- Owner/Admin/Manager can manage bank accounts
DROP POLICY IF EXISTS "ba_manage" ON public.bank_accounts;
CREATE POLICY "ba_manage" ON public.bank_accounts
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name IN ('owner', 'admin', 'manager')
    )
  );

-- Service role full access
DROP POLICY IF EXISTS "ba_service" ON public.bank_accounts;
CREATE POLICY "ba_service" ON public.bank_accounts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 2. Update trigger for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_bank_account_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ba_updated ON public.bank_accounts;
CREATE TRIGGER trg_ba_updated
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_bank_account_timestamp();
