const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const url = process.env.DATABASE_URL;
  console.log(`Checking Database: ${url.split("@")[1].split(":")[0]}...`);

  try {
    // Check Tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT LIKE '_prisma%';
    `;

    console.log("\n--- Tables ---");
    if (tables.length === 0) {
      console.log("NO TABLES FOUND (Database is empty)");
    } else {
      tables.forEach((t) => console.log(`- ${t.table_name}`));
    }

    // Check Policies (RLS)
    const policies = await prisma.$queryRaw`
      SELECT tablename, policyname, cmd, roles 
      FROM pg_policies;
    `;

    console.log("\n--- RLS Policies ---");
    if (policies.length === 0) {
      console.log("NO RLS POLICIES FOUND (Security Vulnerability!)");
    } else {
      policies.forEach((p) =>
        console.log(
          `- Table: ${p.tablename} | Policy: ${p.policyname} | Action: ${p.cmd}`,
        ),
      );
    }

    // Check RLS Enabled Status
    const rlsStatus = await prisma.$queryRaw`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
      WHERE pg_namespace.nspname = 'public' 
      AND relkind = 'r'
      AND relname NOT LIKE '_prisma%';
    `;

    console.log("\n--- RLS Status (Enabled/Disabled) ---");
    rlsStatus.forEach((r) => {
      console.log(`- Table: ${r.relname} | RLS Enabled: ${r.relrowsecurity}`);
    });
  } catch (e) {
    console.error("Error connecting or querying:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
