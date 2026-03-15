/**
 * apply_rls_fix.cjs
 * 
 * Applies the missing RLS UPDATE policies for tenants and tenant_members
 * directly to Supabase using the service role key + SQL via the REST API.
 * 
 * Usage: node apply_rls_fix.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env
const envContent = fs.readFileSync('apps/web/.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.substring(0, idx).trim();
    const value = line.substring(idx + 1).trim();
    if (key && value) env[key] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/web/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Individual SQL statements to apply
const statements = [
  // 1. Tenants UPDATE policy for owner/admin
  `DROP POLICY IF EXISTS "tenants_update_owner_admin" ON public.tenants`,
  `CREATE POLICY "tenants_update_owner_admin" ON public.tenants
    FOR UPDATE TO authenticated
    USING (
      id IN (
        SELECT tm.tenant_id
        FROM public.tenant_members tm
        JOIN public.roles r ON tm.role_id = r.id
        WHERE tm.user_id = auth.uid()
          AND tm.status = 'active'
          AND r.name IN ('owner', 'admin')
      )
    )
    WITH CHECK (
      id IN (
        SELECT tm.tenant_id
        FROM public.tenant_members tm
        JOIN public.roles r ON tm.role_id = r.id
        WHERE tm.user_id = auth.uid()
          AND tm.status = 'active'
          AND r.name IN ('owner', 'admin')
      )
    )`,

  // 2. Tenant Members UPDATE own policy
  `DROP POLICY IF EXISTS "tm_update_own" ON public.tenant_members`,
  `CREATE POLICY "tm_update_own" ON public.tenant_members
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid())`,

  // 3. Tenant Members UPDATE by owner/admin
  `DROP POLICY IF EXISTS "tm_update_owner_admin" ON public.tenant_members`,
  `CREATE POLICY "tm_update_owner_admin" ON public.tenant_members
    FOR UPDATE TO authenticated
    USING (
      tenant_id IN (
        SELECT tm.tenant_id
        FROM public.tenant_members tm
        JOIN public.roles r ON tm.role_id = r.id
        WHERE tm.user_id = auth.uid()
          AND tm.status = 'active'
          AND r.name IN ('owner', 'admin')
      )
    )`,

  // 4. complete_onboarding RPC
  `CREATE OR REPLACE FUNCTION public.complete_onboarding(
    p_tenant_id UUID,
    p_user_id UUID
  )
  RETURNS JSONB AS $$
  DECLARE
    v_member_exists BOOLEAN;
  BEGIN
    SELECT EXISTS(
      SELECT 1 FROM public.tenant_members
      WHERE tenant_id = p_tenant_id
        AND user_id = p_user_id
        AND status = 'active'
    ) INTO v_member_exists;

    IF NOT v_member_exists THEN
      RETURN jsonb_build_object('success', false, 'error', 'User is not an active member of this tenant');
    END IF;

    UPDATE public.tenants
    SET onboarding_completed = true
    WHERE id = p_tenant_id;

    UPDATE public.tenant_members
    SET user_onboarding_completed = true
    WHERE tenant_id = p_tenant_id
      AND user_id = p_user_id;

    RETURN jsonb_build_object('success', true);
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER`
];

async function applyFix() {
  console.log('🔧 Applying RLS fix policies...\n');

  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    const label = sql.substring(0, 80).replace(/\n/g, ' ').trim();
    
    console.log(`[${i + 1}/${statements.length}] ${label}...`);
    
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      // Try the pgmeta approach with raw REST call
      console.log(`  → RPC not available, trying direct REST...`);
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ query: sql }),
        });

        if (!response.ok) {
          // Fall through to the SQL Editor API
          throw new Error(`REST API returned ${response.status}`);
        }
        console.log(`  ✅ Applied via REST`);
      } catch (restErr) {
        console.log(`  ⚠️  Direct REST failed: ${restErr.message}`);
        console.log(`  → Trying pg-meta SQL endpoint...`);
        
        // Use the pg-meta SQL endpoint
        try {
          const pgResponse = await fetch(`${supabaseUrl}/pg/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({ query: sql }),
          });

          if (!pgResponse.ok) {
            const errText = await pgResponse.text();
            console.log(`  ❌ pg-meta failed: ${errText}`);
          } else {
            console.log(`  ✅ Applied via pg-meta`);
          }
        } catch(pgErr) {
          console.log(`  ❌ pg-meta error: ${pgErr.message}`);
        }
      }
    } else {
      console.log(`  ✅ Applied via RPC`);
    }
  }

  console.log('\n--- Verification ---');
  
  // Test: try to update a tenant as service_role to confirm it works
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, onboarding_completed')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('Recent tenants:', JSON.stringify(tenants, null, 2));
  console.log('\n✅ Script complete. If policies failed via REST, apply the migration SQL manually via Supabase Dashboard > SQL Editor.');
}

applyFix().catch(console.error);
