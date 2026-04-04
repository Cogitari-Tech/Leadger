-- Create data_room_documents table
CREATE TABLE IF NOT EXISTS public.data_room_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    storage_bucket TEXT DEFAULT 'data_room',
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    uploaded_by UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investor_updates table
CREATE TABLE IF NOT EXISTS public.investor_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    period TEXT NOT NULL,
    generated_by_ai BOOLEAN DEFAULT false,
    ai_model_used TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.data_room_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_updates ENABLE ROW LEVEL SECURITY;

-- We assume tenant_id check or simple authenticated user policies for now based on standard
CREATE POLICY "Enable read for authenticated users" ON public.data_room_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.data_room_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.data_room_documents
    FOR DELETE USING (auth.role() = 'authenticated');


CREATE POLICY "Enable read for authenticated users" ON public.investor_updates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.investor_updates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.investor_updates
    FOR UPDATE USING (auth.role() = 'authenticated');
