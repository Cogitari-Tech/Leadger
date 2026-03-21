import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import runwayRoutes from "./routes/finance/runway";
import unitEconomicsRoutes from "./routes/finance/unit-economics";
import burnRateRoutes from "./routes/finance/burn-rate";
import analyzeRoutes from "./routes/ai/analyze";
import weeklyDigestRoutes from "./routes/ai/weekly-digest";
import { inngestRoutes } from "./routes/inngest";
import healthScoreRoutes from "./routes/strategic/health-score";
import northStarRoutes from "./routes/strategic/north-star";
import bmcRoutes from "./routes/strategic/bmc";
import okrsRoutes from "./routes/strategic/okrs";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Permitir do Vite frontend locamente, depois ajustar pra prod
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.route("/api/finance/runway", runwayRoutes);
app.route("/api/finance/unit-economics", unitEconomicsRoutes);
app.route("/api/finance/burn-rate", burnRateRoutes);
app.route("/api/ai/analyze", analyzeRoutes);
app.route("/api/ai/weekly-digest", weeklyDigestRoutes);
app.route("/api/strategic/health-score", healthScoreRoutes);
app.route("/api/strategic/north-star", northStarRoutes);
app.route("/api/strategic/bmc", bmcRoutes);
app.route("/api/strategic/okrs", okrsRoutes);

app.on(["GET", "POST", "PUT"], "/api/inngest", (c) => inngestRoutes(c));

export default app;
