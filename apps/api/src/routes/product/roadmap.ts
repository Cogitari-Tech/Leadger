import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { validateBody } from "../../middleware/validate";
import { createRoadmapSchema, updateRoadmapSchema } from "../../schemas";
import { AppEnv } from "../../types/env";

const roadmapRoutes = new Hono<AppEnv>();

roadmapRoutes.use("*", authMiddleware);
roadmapRoutes.use("*", tenancyMiddleware);

roadmapRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const quarter = c.req.query("quarter");
  const status = c.req.query("status");

  try {
    const items = await prisma.roadmap_items.findMany({
      where: {
        tenant_id: tenantId,
        ...(quarter ? { quarter } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        milestone: true,
        key_result: true,
      },
      orderBy: { created_at: "desc" },
    });
    return c.json(items);
  } catch (err) {
    console.error("Error fetching roadmap items:", err);
    return c.json({ error: "Failed to fetch roadmap items" }, 500);
  }
});

roadmapRoutes.post("/", validateBody(createRoadmapSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const body = c.get("validatedBody");

  try {
    const item = await prisma.roadmap_items.create({
      data: {
        tenant_id: tenantId,
        title: body.title,
        description: body.description ?? null,
        status: body.status,
        quarter: body.quarter,
        github_issue_id: body.github_issue_id ?? null,
        github_issue_url: body.github_issue_url ?? null,
        key_result_id: body.key_result_id ?? null,
        milestone_id: body.milestone_id ?? null,
        start_date: body.start_date ? new Date(body.start_date) : null,
        end_date: body.end_date ? new Date(body.end_date) : null,
      },
    });
    return c.json(item, 201);
  } catch (err) {
    console.error("Error creating roadmap item:", err);
    return c.json({ error: "Failed to create roadmap item" }, 500);
  }
});

roadmapRoutes.patch("/:id", validateBody(updateRoadmapSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const itemId = c.req.param("id");
  const body = c.get("validatedBody");

  try {
    const existing = await prisma.roadmap_items.findFirst({
      where: { id: itemId, tenant_id: tenantId },
    });

    if (!existing) {
      return c.json({ error: "Roadmap item not found" }, 404);
    }

    const updated = await prisma.roadmap_items.update({
      where: { id: itemId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.quarter !== undefined && { quarter: body.quarter }),
        ...(body.github_issue_id !== undefined && {
          github_issue_id: body.github_issue_id,
        }),
        ...(body.github_issue_url !== undefined && {
          github_issue_url: body.github_issue_url,
        }),
        ...(body.key_result_id !== undefined && {
          key_result_id: body.key_result_id,
        }),
        ...(body.milestone_id !== undefined && {
          milestone_id: body.milestone_id,
        }),
        ...(body.start_date !== undefined && {
          start_date: body.start_date ? new Date(body.start_date) : null,
        }),
        ...(body.end_date !== undefined && {
          end_date: body.end_date ? new Date(body.end_date) : null,
        }),
        updated_at: new Date(),
      },
    });
    return c.json(updated);
  } catch (err) {
    console.error("Error updating roadmap item:", err);
    return c.json({ error: "Failed to update roadmap item" }, 500);
  }
});

roadmapRoutes.delete("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const itemId = c.req.param("id");

  try {
    const existing = await prisma.roadmap_items.findFirst({
      where: { id: itemId, tenant_id: tenantId },
    });

    if (!existing) {
      return c.json({ error: "Roadmap item not found" }, 404);
    }

    await prisma.roadmap_items.delete({ where: { id: itemId } });
    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting roadmap item:", err);
    return c.json({ error: "Failed to delete roadmap item" }, 500);
  }
});

export default roadmapRoutes;
