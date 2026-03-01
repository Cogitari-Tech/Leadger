const { Client } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const dsn = process.env.MCP_SERVER_POSTGRES_DSN;

const client = new Client({
  connectionString: dsn,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected...");
    // Check triggers on auth.users
    const res = await client.query(`
      SELECT tgname, proname 
      FROM pg_trigger t 
      JOIN pg_proc p ON t.tgfoid = p.oid
      JOIN pg_class c ON t.tgrelid = c.oid 
      JOIN pg_namespace n ON c.relnamespace = n.oid 
      WHERE n.nspname = 'auth' AND c.relname = 'users';
    `);
    console.log("Triggers on auth.users:", res.rows);

    // Also check for any errors in a supposed log table if it exists or common profile tables
    const res2 = await client.query(
      "SELECT * FROM public.profiles WHERE id = '69fc7475-5047-47ce-ac0b-8fbdccbf7bb3'",
    );
    console.log("Profile row:", res2.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
