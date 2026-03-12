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
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bGRrZ2tubnZ2dG1scGtxc2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTQ2NDcsImV4cCI6MjA4NjkzMDY0N30.M9Oe89xO6uwhNtEmbpuNjQmnAfrak-g6vii5HE8azsc";

const betaUrl = "https://grqhnhftseisxsobamju.supabase.co";
const betaAnon =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycWhuaGZ0c2Vpc3hzb2JhbWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTQwMjQsImV4cCI6MjA4NjkzMDAyNH0.l3DP2Bz9WcHVK9Lj3OgOwiiltUt2wZVP5AQtGsZ0QcU";

async function main() {
  await fetchOpenApi("BETA", betaUrl, betaAnon);
  await fetchOpenApi("PROD", prodUrl, prodAnon);
}
main();
