-- ==========================================================
-- Migration: Finance Module Tables
-- Creates accounting, cap table, burn rate, projections,
-- and unit economics tables for the finance module.
-- ==========================================================

-- ============================================================
-- 1. ACCOUNTS — Chart of Accounts (Plano de Contas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(20) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'Ativo', 'Passivo', 'Patrimonio', 'Receita', 'Despesa',
    'checking', 'savings', 'investment', 'credit_card', 'cash'
  )),
  is_analytical BOOLEAN DEFAULT true,
  balance NUMERIC(18,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  parent_id UUID REFERENCES public.accounts(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_tenant ON public.accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounts_code ON public.accounts(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(type);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "accounts_select_members" ON public.accounts;
CREATE POLICY "accounts_select_members" ON public.accounts
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "accounts_manage" ON public.accounts;
CREATE POLICY "accounts_manage" ON public.accounts
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

DROP POLICY IF EXISTS "accounts_service" ON public.accounts;
CREATE POLICY "accounts_service" ON public.accounts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 2. TRANSACTIONS — Double-Entry Accounting Entries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  account_debit_id UUID NOT NULL REFERENCES public.accounts(id),
  account_credit_id UUID NOT NULL REFERENCES public.accounts(id),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_different_accounts CHECK (account_debit_id != account_credit_id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON public.transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_debit ON public.transactions(account_debit_id);
CREATE INDEX IF NOT EXISTS idx_transactions_credit ON public.transactions(account_credit_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_members" ON public.transactions;
CREATE POLICY "transactions_select_members" ON public.transactions
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "transactions_manage" ON public.transactions;
CREATE POLICY "transactions_manage" ON public.transactions
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

DROP POLICY IF EXISTS "transactions_service" ON public.transactions;
CREATE POLICY "transactions_service" ON public.transactions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 3. BURN_RATE_ALERTS — Burn Rate Monitoring Alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.burn_rate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('runway_months', 'burn_rate_change', 'cash_low')),
  threshold_value NUMERIC(18,2) NOT NULL,
  comparison VARCHAR(10) NOT NULL CHECK (comparison IN ('below', 'above')),
  is_active BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT true,
  notify_in_app BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bra_tenant ON public.burn_rate_alerts(tenant_id);

ALTER TABLE public.burn_rate_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bra_select_members" ON public.burn_rate_alerts;
CREATE POLICY "bra_select_members" ON public.burn_rate_alerts
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "bra_manage" ON public.burn_rate_alerts;
CREATE POLICY "bra_manage" ON public.burn_rate_alerts
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

DROP POLICY IF EXISTS "bra_service" ON public.burn_rate_alerts;
CREATE POLICY "bra_service" ON public.burn_rate_alerts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 4. FINANCIAL_PROJECTIONS — Saved Financial Projections
-- ============================================================
CREATE TABLE IF NOT EXISTS public.financial_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  projection_type VARCHAR(20) NOT NULL DEFAULT 'combined' CHECK (projection_type IN ('revenue', 'expense', 'combined')),
  start_year INT NOT NULL,
  end_year INT NOT NULL,
  scenarios JSONB NOT NULL DEFAULT '{}'::jsonb,
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fp_tenant ON public.financial_projections(tenant_id);

ALTER TABLE public.financial_projections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fp_select_members" ON public.financial_projections;
CREATE POLICY "fp_select_members" ON public.financial_projections
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "fp_manage" ON public.financial_projections;
CREATE POLICY "fp_manage" ON public.financial_projections
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

DROP POLICY IF EXISTS "fp_service" ON public.financial_projections;
CREATE POLICY "fp_service" ON public.financial_projections
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 5. CAP_TABLE_ROUNDS — Investment Rounds
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cap_table_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL,
  round_type VARCHAR(20) NOT NULL DEFAULT 'seed' CHECK (round_type IN (
    'pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'bridge', 'other'
  )),
  pre_money_valuation NUMERIC(18,2) NOT NULL DEFAULT 0,
  amount_raised NUMERIC(18,2) NOT NULL DEFAULT 0,
  post_money_valuation NUMERIC(18,2) GENERATED ALWAYS AS (pre_money_valuation + amount_raised) STORED,
  round_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ctr_tenant ON public.cap_table_rounds(tenant_id);

ALTER TABLE public.cap_table_rounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ctr_select_members" ON public.cap_table_rounds;
CREATE POLICY "ctr_select_members" ON public.cap_table_rounds
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "ctr_manage" ON public.cap_table_rounds;
CREATE POLICY "ctr_manage" ON public.cap_table_rounds
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

DROP POLICY IF EXISTS "ctr_service" ON public.cap_table_rounds;
CREATE POLICY "ctr_service" ON public.cap_table_rounds
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 6. CAP_TABLE_SHAREHOLDERS — Shareholder Registry
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cap_table_shareholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  round_id UUID REFERENCES public.cap_table_rounds(id) ON DELETE SET NULL,
  shareholder_name TEXT NOT NULL,
  shareholder_type VARCHAR(20) NOT NULL DEFAULT 'founder' CHECK (shareholder_type IN (
    'founder', 'investor', 'employee', 'advisor', 'other'
  )),
  shares_count BIGINT NOT NULL DEFAULT 0,
  share_price NUMERIC(18,6) DEFAULT 0,
  ownership_percentage NUMERIC(8,4) NOT NULL DEFAULT 0,
  investment_amount NUMERIC(18,2) DEFAULT 0,
  vesting_schedule JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cts_tenant ON public.cap_table_shareholders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cts_round ON public.cap_table_shareholders(round_id);

ALTER TABLE public.cap_table_shareholders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cts_select_members" ON public.cap_table_shareholders;
CREATE POLICY "cts_select_members" ON public.cap_table_shareholders
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "cts_manage" ON public.cap_table_shareholders;
CREATE POLICY "cts_manage" ON public.cap_table_shareholders
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

DROP POLICY IF EXISTS "cts_service" ON public.cap_table_shareholders;
CREATE POLICY "cts_service" ON public.cap_table_shareholders
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 7. UNIT_ECONOMICS_SNAPSHOTS — Monthly CAC/LTV Snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS public.unit_economics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_date DATE NOT NULL,
  total_customers INT NOT NULL DEFAULT 0,
  new_customers INT NOT NULL DEFAULT 0,
  churned_customers INT DEFAULT 0,
  total_revenue NUMERIC(18,2) DEFAULT 0,
  marketing_spend NUMERIC(18,2) DEFAULT 0,
  sales_spend NUMERIC(18,2) DEFAULT 0,
  cac NUMERIC(18,2) DEFAULT 0,
  ltv NUMERIC(18,2) DEFAULT 0,
  ltv_cac_ratio NUMERIC(8,2) DEFAULT 0,
  payback_period_months NUMERIC(8,2) DEFAULT 0,
  arpu NUMERIC(18,2) DEFAULT 0,
  monthly_churn_rate NUMERIC(8,4) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, period_date)
);

CREATE INDEX IF NOT EXISTS idx_ues_tenant ON public.unit_economics_snapshots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ues_period ON public.unit_economics_snapshots(period_date);

ALTER TABLE public.unit_economics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ues_select_members" ON public.unit_economics_snapshots;
CREATE POLICY "ues_select_members" ON public.unit_economics_snapshots
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "ues_manage" ON public.unit_economics_snapshots;
CREATE POLICY "ues_manage" ON public.unit_economics_snapshots
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

DROP POLICY IF EXISTS "ues_service" ON public.unit_economics_snapshots;
CREATE POLICY "ues_service" ON public.unit_economics_snapshots
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 8. RPC: get_account_balances — Report-oriented balance query
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_account_balances(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  account_id UUID,
  account_name TEXT,
  account_code VARCHAR(20),
  account_type VARCHAR(30),
  is_analytical BOOLEAN,
  debit_total NUMERIC,
  credit_total NUMERIC,
  balance NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS account_id,
    a.name AS account_name,
    a.code AS account_code,
    a.type AS account_type,
    a.is_analytical,
    COALESCE(SUM(CASE WHEN t.account_debit_id = a.id THEN t.amount ELSE 0 END), 0) AS debit_total,
    COALESCE(SUM(CASE WHEN t.account_credit_id = a.id THEN t.amount ELSE 0 END), 0) AS credit_total,
    CASE
      WHEN a.type IN ('Ativo', 'Despesa', 'checking', 'savings', 'investment', 'cash') THEN
        COALESCE(SUM(CASE WHEN t.account_debit_id = a.id THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.account_credit_id = a.id THEN t.amount ELSE 0 END), 0)
      ELSE
        COALESCE(SUM(CASE WHEN t.account_credit_id = a.id THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.account_debit_id = a.id THEN t.amount ELSE 0 END), 0)
    END AS balance
  FROM public.accounts a
  LEFT JOIN public.transactions t
    ON (t.account_debit_id = a.id OR t.account_credit_id = a.id)
    AND t.date >= p_start_date::date
    AND t.date <= p_end_date::date
  WHERE a.is_analytical = true
  GROUP BY a.id, a.name, a.code, a.type, a.is_analytical
  ORDER BY a.code;
END;
$$;

-- ============================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_finance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_accounts_updated ON public.accounts;
CREATE TRIGGER trg_accounts_updated
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_finance_timestamp();

DROP TRIGGER IF EXISTS trg_bra_updated ON public.burn_rate_alerts;
CREATE TRIGGER trg_bra_updated
  BEFORE UPDATE ON public.burn_rate_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_finance_timestamp();

DROP TRIGGER IF EXISTS trg_fp_updated ON public.financial_projections;
CREATE TRIGGER trg_fp_updated
  BEFORE UPDATE ON public.financial_projections
  FOR EACH ROW EXECUTE FUNCTION public.update_finance_timestamp();

DROP TRIGGER IF EXISTS trg_ctr_updated ON public.cap_table_rounds;
CREATE TRIGGER trg_ctr_updated
  BEFORE UPDATE ON public.cap_table_rounds
  FOR EACH ROW EXECUTE FUNCTION public.update_finance_timestamp();

DROP TRIGGER IF EXISTS trg_cts_updated ON public.cap_table_shareholders;
CREATE TRIGGER trg_cts_updated
  BEFORE UPDATE ON public.cap_table_shareholders
  FOR EACH ROW EXECUTE FUNCTION public.update_finance_timestamp();
