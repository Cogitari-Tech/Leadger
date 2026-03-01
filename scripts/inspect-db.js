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
    // Read function definition
    const res = await client.query(`
      SELECT prosrc 
      FROM pg_proc 
      WHERE proname = 'handle_new_user_registration';
    `);
    console.log("Function Source:", res.rows[0]?.prosrc);

    // List all tables in public schema
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log(
      "Tables in public:",
      tables.rows.map((t) => t.table_name),
    );
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
