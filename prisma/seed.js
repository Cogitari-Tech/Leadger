const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(
    __dirname,
    "../supabase/migrations/20240101_initial_rls.sql",
  );
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("Applying RLS Policies from SQL file...");

  // Split by semicolon to execute statements separately if needed,
  // but executeRaw can handle blocks often.
  // For safety, let's split.
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log("Executed statement successfully.");
    } catch (e) {
      console.error("Error executing statement:", e.message);
      // Continue, as some policies might already exist
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
