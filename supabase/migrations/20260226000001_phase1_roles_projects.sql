-- ==========================================================
-- FASE 1: Complete RBAC infrastructure + Projects + Subscription-ready
-- Creates: roles, permissions, role_permissions, projects, project_members
-- Alters: tenants (add missing columns), tenant_members (add role_id)
-- Seeds: 6 roles + 21 permissions + role-permission mappings
-- ==========================================================

-- 1. Add missing columns to tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS plan_status VARCHAR(50) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 100,
  ADD COLUMN IF NOT EXISTS max_projects INT DEFAULT 50;

-- 2. Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  hierarchy_level INT DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: system roles are unique by name (tenant_id is null)
-- Tenant-specific roles are unique per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_name_unique
  ON public.roles (name) WHERE tenant_id IS NULL AND is_system = true;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_read" ON public.roles;
CREATE POLICY "roles_read" ON public.roles
  FOR SELECT USING (
    is_system = true
    OR tenant_id::text = (auth.jwt() ->> 'tenant_id')
  );

DROP POLICY IF EXISTS "roles_manage" ON public.roles;
CREATE POLICY "roles_manage" ON public.roles
  FOR ALL USING (
    tenant_id::text = (auth.jwt() ->> 'tenant_id')
    AND NOT is_system
  );

-- 3. Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  module VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "permissions_read" ON public.permissions;
CREATE POLICY "permissions_read" ON public.permissions
  FOR SELECT USING (true);

-- 4. Create role_permissions junction
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "role_permissions_read" ON public.role_permissions;
CREATE POLICY "role_permissions_read" ON public.role_permissions
  FOR SELECT USING (true);

-- 5. Add role_id to tenant_members if it doesn't exist
ALTER TABLE public.tenant_members
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id),
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Create invitations table (for future team invites)
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES public.roles(id),
  invited_by UUID REFERENCES auth.users(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invitations_tenant" ON public.invitations;
CREATE POLICY "invitations_tenant" ON public.invitations
  FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'));

-- 7. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_tenant" ON public.projects;
CREATE POLICY "projects_tenant" ON public.projects
  FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'));

-- 8. Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.tenant_members(id) ON DELETE CASCADE,
  project_role VARCHAR(50) DEFAULT 'member',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, member_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_members_tenant" ON public.project_members;
CREATE POLICY "project_members_tenant" ON public.project_members
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE tenant_id::text = (auth.jwt() ->> 'tenant_id')
    )
  );

-- ===========================
-- SEED DATA
-- ===========================

-- 9. Seed 6 hierarchical roles
INSERT INTO public.roles (name, display_name, description, hierarchy_level, is_system) VALUES
  ('owner',   'Dono',          'Proprietário do tenant. Gerencia billing e configuração global.', 100, true),
  ('admin',   'Administrador', 'Gestão completa do tenant exceto billing.',                       90, true),
  ('manager', 'Gestor',        'Lidera projetos e equipes. CRUD em recursos.',                    70, true),
  ('auditor', 'Auditor',       'Executa auditorias e cria achados. Sem acesso financeiro.',       50, true),
  ('analyst', 'Analista',      'Visualiza dados e gera relatórios.',                              40, true),
  ('viewer',  'Observador',    'Visualização limitada. Stakeholders externos.',                   10, true)
ON CONFLICT DO NOTHING;

-- 10. Seed permissions
INSERT INTO public.permissions (code, module, action, description) VALUES
  ('audit.view',        'audit',      'view',   'Visualizar módulo de auditoria'),
  ('audit.create',      'audit',      'create', 'Criar programas e achados'),
  ('audit.edit',        'audit',      'edit',   'Editar programas e achados'),
  ('audit.delete',      'audit',      'delete', 'Excluir programas e achados'),
  ('audit.export',      'audit',      'export', 'Exportar relatórios'),
  ('finance.view',      'finance',    'view',   'Visualizar módulo financeiro'),
  ('finance.create',    'finance',    'create', 'Criar registros financeiros'),
  ('finance.edit',      'finance',    'edit',   'Editar registros financeiros'),
  ('finance.delete',    'finance',    'delete', 'Excluir registros financeiros'),
  ('finance.export',    'finance',    'export', 'Exportar dados financeiros'),
  ('compliance.view',   'compliance', 'view',   'Visualizar módulo de compliance'),
  ('compliance.manage', 'compliance', 'manage', 'Gerenciar frameworks e riscos'),
  ('admin.manage',      'admin',      'manage', 'Gerenciar configurações do tenant'),
  ('team.manage',       'admin',      'manage', 'Gerenciar equipe e convites'),
  ('github.view',       'github',     'view',   'Visualizar dados do GitHub'),
  ('github.manage',     'github',     'manage', 'Gerenciar integrações GitHub'),
  ('github.admin',      'github',     'admin',  'Administrar configurações GitHub'),
  ('projects.view',     'projects',   'view',   'Visualizar projetos'),
  ('projects.create',   'projects',   'create', 'Criar projetos'),
  ('projects.edit',     'projects',   'edit',   'Editar projetos'),
  ('projects.delete',   'projects',   'delete', 'Excluir projetos')
ON CONFLICT (code) DO NOTHING;

-- 11. Assign permissions to roles

-- Owner: ALL
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.name = 'owner' AND r.is_system = true
ON CONFLICT DO NOTHING;

-- Admin: ALL
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.name = 'admin' AND r.is_system = true
ON CONFLICT DO NOTHING;

-- Manager: audit, compliance, finance, github, projects
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.name = 'manager' AND r.is_system = true
  AND p.module IN ('audit', 'compliance', 'finance', 'github', 'projects')
ON CONFLICT DO NOTHING;

-- Auditor: audit (all), compliance (all), github (view), projects (view+edit)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.name = 'auditor' AND r.is_system = true
  AND (
    p.module = 'audit'
    OR p.module = 'compliance'
    OR (p.module = 'github' AND p.action = 'view')
    OR (p.module = 'projects' AND p.action IN ('view', 'edit'))
  )
ON CONFLICT DO NOTHING;

-- Analyst: finance (view), compliance (view), github (view), projects (view)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.name = 'analyst' AND r.is_system = true
  AND p.action = 'view'
  AND p.module IN ('finance', 'compliance', 'github', 'projects')
ON CONFLICT DO NOTHING;

-- Viewer: audit (view), compliance (view), projects (view)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.name = 'viewer' AND r.is_system = true
  AND p.action = 'view'
  AND p.module IN ('audit', 'compliance', 'projects')
ON CONFLICT DO NOTHING;

-- 12. Assign existing tenant_members the 'owner' role if they have no role
UPDATE public.tenant_members
SET role_id = (SELECT id FROM public.roles WHERE name = 'owner' AND is_system = true LIMIT 1)
WHERE role_id IS NULL;
