import { Hono } from "hono";
import { inngest } from "../../jobs/queue";
import { PrismaClient } from "@prisma/client";
import { documentsRouter } from "./documents";
import { AppEnv } from "../../types/env";

const prisma = new PrismaClient();
const investorRouter = new Hono<AppEnv>();

investorRouter.route("/documents", documentsRouter);

investorRouter.get("/updates", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const updates = await prisma.investor_updates.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });

    return c.json({
      data: updates,
      meta: { message: "Investor updates list" },
    });
  } catch (error) {
    console.error("Error fetching investor updates:", error);
    return c.json({ error: "Failed to fetch updates" }, 500);
  }
});

investorRouter.post("/reports/generate", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const tenantId = c.get("tenantId") || body?.tenantId; // fallback se n tiver auth middleware test hook
  const documentId = body?.documentId || crypto.randomUUID();

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  await inngest.send({
    name: "investor.report/generate",
    data: {
      documentId,
      tenantId,
      type: body?.type || "monthly",
      model: body?.model || "fast",
      byokKey: body?.byokKey,
      byokProvider: body?.byokProvider,
    },
  });

  return c.json({ status: "queued", reportId: documentId }, 202);
});

export default investorRouter;
