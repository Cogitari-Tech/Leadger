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

const prodUrl = "https://yuldkgknnvvtmlpkqsji.supabase.co";
const prodAnon =
  "REDACTED_SUPABASE_ANON_JWT";

const betaUrl = "https://grqhnhftseisxsobamju.supabase.co";
const betaAnon =
  "REDACTED_SUPABASE_ANON_JWT";

async function main() {
  await fetchOpenApi("BETA", betaUrl, betaAnon);
  await fetchOpenApi("PROD", prodUrl, prodAnon);
}
main();
