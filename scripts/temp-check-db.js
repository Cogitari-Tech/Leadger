const fs = require("fs");

async function fetchOpenApi(envName, url, anonKey) {
  const res = await fetch(`${url}/rest/v1/?apikey=${anonKey}`);
  const data = await res.json();
  const defs = data.definitions;

  const accountsDef = defs["accounts"];
  const transactionsDef = defs["transactions"];

  console.log(`\n--- ${envName} ---`);
  if (!accountsDef) console.log("accounts: MISSING");
  else
    console.log(
      "accounts columns:",
      Object.keys(accountsDef.properties).join(", "),
    );

  if (!transactionsDef) console.log("transactions: MISSING");
  else
    console.log(
      "transactions columns:",
      Object.keys(transactionsDef.properties).join(", "),
    );
}

const prodUrl = process.env.SUPABASE_PROD_URL;
const prodAnon = process.env.SUPABASE_PROD_ANON_KEY;

const betaUrl = process.env.SUPABASE_BETA_URL;
const betaAnon = process.env.SUPABASE_BETA_ANON_KEY;

async function main() {
  if (!betaUrl || !betaAnon || !prodUrl || !prodAnon) {
    throw new Error(
      "Missing required environment variables: SUPABASE_BETA_URL, SUPABASE_BETA_ANON_KEY, SUPABASE_PROD_URL, SUPABASE_PROD_ANON_KEY",
    );
  }

  await fetchOpenApi("BETA", betaUrl, betaAnon);
  await fetchOpenApi("PROD", prodUrl, prodAnon);
}
main();
