const { defineConfig } = require("@prisma/config");
require("dotenv").config();

module.exports = defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.MCP_SERVER_POSTGRES_DSN || process.env.DATABASE_URL,
  },
});
