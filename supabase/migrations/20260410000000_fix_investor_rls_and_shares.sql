-- Fix RLS for data_room_documents (Current was too broad)
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.data_room_documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.data_room_documents;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.data_room_documents;

CREATE POLICY "Users can only see documents from their tenant" ON public.data_room_documents
    FOR SELECT USING (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

CREATE POLICY "Users can insert documents for their tenant" ON public.data_room_documents
    FOR INSERT WITH CHECK (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

CREATE POLICY "Users can delete documents from their tenant" ON public.data_room_documents
    FOR DELETE USING (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

-- Fix RLS for investor_updates
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.investor_updates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.investor_updates;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.investor_updates;

CREATE POLICY "Users can only see updates from their tenant" ON public.investor_updates
    FOR SELECT USING (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

CREATE POLICY "Users can insert updates for their tenant" ON public.investor_updates
    FOR INSERT WITH CHECK (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

CREATE POLICY "Users can update updates from their tenant" ON public.investor_updates
    FOR UPDATE USING (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

-- Create data_room_shares table
CREATE TABLE IF NOT EXISTS public.data_room_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    document_id UUID REFERENCES public.data_room_documents(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for data_room_shares
ALTER TABLE public.data_room_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see shares from their tenant" ON public.data_room_shares
    FOR SELECT USING (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

CREATE POLICY "Users can create shares for their tenant" ON public.data_room_shares
    FOR INSERT WITH CHECK (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

-- Create audit logs for access (Phase 2 requirement)
CREATE TABLE IF NOT EXISTS public.data_room_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    share_id UUID REFERENCES public.data_room_shares(id) ON DELETE CASCADE,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB
);

ALTER TABLE public.data_room_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see logs from their tenant" ON public.data_room_access_logs
    FOR SELECT USING (tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
