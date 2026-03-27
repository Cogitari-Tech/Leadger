
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try a few possible locations for .env
const possiblePaths = [
  path.join(__dirname, 'apps/web/.env'),
  path.join(__dirname, '.env'),
  'apps/web/.env',
  '.env'
];

let envFileContent = '';
for (const p of possiblePaths) {
  try {
    envFileContent = fs.readFileSync(p, 'utf8');
    console.log('Loaded env from:', p);
    break;
  } catch (e) {}
}

const env = {};
if (envFileContent) {
  envFileContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) env[key.trim()] = rest.join('=').trim();
  });
}

const supabase = createClient(
  env.SUPABASE_URL || env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Checking Supabase...');
  try {
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, onboarding_completed, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (tenantError) {
      console.error('Tenant fetch error:', tenantError);
    } else {
      console.log('Recent Tenants:');
      console.log(JSON.stringify(tenants, null, 2));
    }

    const { data: members, error: memError } = await supabase
      .from('tenant_members')
      .select('user_id, tenant_id, user_onboarding_completed, status, created_at, role:roles(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (memError) {
      console.error('Member fetch error:', memError);
    } else {
      console.log('Recent Members:');
      console.log(JSON.stringify(members, null, 2));

      if (tenants.length > 0) {
        console.log('Testing update for tenant:', tenants[0].id);
        const { data: updateData, error: updateErr } = await supabase
          .from('tenants')
          .update({ onboarding_completed: true })
          .eq('id', tenants[0].id)
          .select();
        
        if (updateErr) {
          console.error('Update test failed:', updateErr);
        } else {
          console.log('Update test success:', updateData);
        }
      }
    }
  } catch (err) {
    console.error('Script error:', err);
  }
}

check();
