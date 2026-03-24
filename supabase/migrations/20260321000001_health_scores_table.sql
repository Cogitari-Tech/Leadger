-- ==========================================================
-- Migration: Health Scores Table
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_score INT NOT NULL,
  financial INT NOT NULL,
  product INT NOT NULL,
  compliance INT NOT NULL,
  team INT NOT NULL,
  commercial INT NOT NULL,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_scores_tenant ON public.health_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_date ON public.health_scores(date);

ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_scores_select_members" ON public.health_scores;
CREATE POLICY "health_scores_select_members" ON public.health_scores
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "health_scores_manage" ON public.health_scores;
CREATE POLICY "health_scores_manage" ON public.health_scores
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

DROP POLICY IF EXISTS "health_scores_service" ON public.health_scores;
CREATE POLICY "health_scores_service" ON public.health_scores
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
