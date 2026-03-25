-- Criação da tabela de Headcount Planning
CREATE TABLE IF NOT EXISTS public.headcount_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  department TEXT NOT NULL,
  monthly_salary NUMERIC(15, 2) NOT NULL,
  expected_start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'hired', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.headcount_plans ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view their tenant's headcount plans" 
ON public.headcount_plans FOR SELECT 
USING (tenant_id IN (
  SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert headcount plans for their tenant" 
ON public.headcount_plans FOR INSERT 
WITH CHECK (tenant_id IN (
  SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their tenant's headcount plans" 
ON public.headcount_plans FOR UPDATE 
USING (tenant_id IN (
  SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete their tenant's headcount plans" 
ON public.headcount_plans FOR DELETE 
USING (tenant_id IN (
  SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
));

-- Trigger para updated_at
CREATE TRIGGER update_headcount_plans_updated_at
  BEFORE UPDATE ON public.headcount_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
