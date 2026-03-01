const { Client } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const dsn = process.env.MCP_SERVER_POSTGRES_DSN;

if (!dsn) {
  console.error("Missing MCP_SERVER_POSTGRES_DSN");
  process.exit(1);
}

const client = new Client({
  connectionString: dsn,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database...");
    const res = await client.query(
      "SELECT id, email, encrypted_password FROM auth.users WHERE email = 'teste@cogitari.com'",
    );
    if (res.rows.length === 0) {
      console.log("User 'teste@cogitari.com' not found.");
    } else {
      console.log("User found:", res.rows[0]);
    }
  } catch (err) {
    console.error("Error running query", err);
  } finally {
    await client.end();
  }
}

run();
