import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app";

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Starting Hono API server on port ${port}...`);

const server = serve({
  fetch: app.fetch,
  port,
});

server.on("listening", () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});

process.on("SIGINT", () => {
  console.log(" shutting down...");
  server.close();
  process.exit();
});
