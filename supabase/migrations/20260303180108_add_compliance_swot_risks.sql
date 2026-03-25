CREATE TABLE IF NOT EXISTS public.swot_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('strength', 'weakness', 'opportunity', 'threat')),
    impact INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.swot_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view swot items of their tenant" ON public.swot_items
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_members.tenant_id = swot_items.tenant_id
        AND tenant_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert swot items to their tenant" ON public.swot_items
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_members.tenant_id = swot_items.tenant_id
        AND tenant_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their tenant swot items" ON public.swot_items
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_members.tenant_id = swot_items.tenant_id
        AND tenant_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their tenant swot items" ON public.swot_items
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_members.tenant_id = swot_items.tenant_id
        AND tenant_members.user_id = auth.uid()
    ));


CREATE TABLE IF NOT EXISTS public.risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('operational', 'financial', 'strategic', 'compliance', 'cybersecurity')),
    likelihood INTEGER NOT NULL DEFAULT 3,
    impact INTEGER NOT NULL DEFAULT 3,
    score INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigated', 'accepted', 'transferred')),
    owner TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risks of their tenant" ON public.risks
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_members.tenant_id = risks.tenant_id
        AND tenant_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert risks to their tenant" ON public.risks
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_members.tenant_id = risks.tenant_id
        AND tenant_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their tenant risks" ON public.risks
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_members.tenant_id = risks.tenant_id
        AND tenant_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their tenant risks" ON public.risks
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_members.tenant_id = risks.tenant_id
        AND tenant_members.user_id = auth.uid()
    ));
