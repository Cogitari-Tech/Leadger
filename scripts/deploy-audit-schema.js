#!/usr/bin/env node
// deploy-audit-schema.js
// Applies the audit module schema + seed migrations to audit-tool databases

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const MIGRATIONS = [
  "supabase/migrations/20260220_audit_module_schema.sql",
  "supabase/migrations/20260220_audit_module_seed.sql",
];

const PROJECTS = [
  { name: "audit-tool-beta", dsn: process.env.AUDIT_TOOL_BETA_DSN },
  { name: "audit-tool-prod", dsn: process.env.AUDIT_TOOL_PROD_DSN },
];

async function applyMigrations(project) {
  if (!project.dsn) {
    console.warn(`⚠️  [${project.name}] DSN not set — skipping.`);
    return;
  }

  const client = new Client({
    connectionString: project.dsn,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    console.log(`🔗 [${project.name}] Connected.`);

    for (const migrationPath of MIGRATIONS) {
      const sql = fs.readFileSync(path.join(__dirname, migrationPath), "utf8");
      const fileName = path.basename(migrationPath);
      try {
        await client.query(sql);
        console.log(`  ✅ ${fileName} applied.`);
      } catch (err) {
        console.error(`  ❌ ${fileName} failed: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`❌ [${project.name}] Connection error: ${err.message}`);
  } finally {
    await client.end();
  }
}

(async () => {
  console.log("🛡️  Deploying audit module schema...\n");
  for (const project of PROJECTS) {
    await applyMigrations(project);
    console.log();
  }
  console.log("Done.");
})();
