import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const milestonesRoutes = new Hono<AppEnv>();

milestonesRoutes.use("*", authMiddleware);
milestonesRoutes.use("*", tenancyMiddleware);

/** GET / — List milestones with optional filters */
milestonesRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const status = c.req.query("status");
  const category = c.req.query("category");
  const prisma = new PrismaClient();

  try {
    const where: any = { tenant_id: tenantId };
    if (status) where.status = status;
    if (category) where.category = category;

    const milestones = await prisma.milestones.findMany({
      where,
      orderBy: { target_date: "asc" },
    });
    return c.json(milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return c.json({ error: "Failed to fetch milestones" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

/** POST / — Create a milestone */
milestonesRoutes.post("/", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("user").id;
  const prisma = new PrismaClient();

  try {
    const body = await c.req.json();

    const milestone = await prisma.milestones.create({
      data: {
        tenant_id: tenantId as string,
        title: body.title,
        description: body.description,
        target_date: body.target_date ? new Date(body.target_date) : null,
        status: body.status || "planned",
        category: body.category || "product",
        linked_okr_id: body.linked_okr_id,
        created_by: userId,
      },
    });

    return c.json(milestone, 201);
  } catch (error) {
    console.error("Error creating milestone:", error);
    return c.json({ error: "Failed to create milestone" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

/** PATCH /:id — Update milestone */
milestonesRoutes.patch("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");
  const prisma = new PrismaClient();

  try {
    const body = await c.req.json();
    const updateData: any = { updated_at: new Date() };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.target_date !== undefined)
      updateData.target_date = body.target_date
        ? new Date(body.target_date)
        : null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.linked_okr_id !== undefined)
      updateData.linked_okr_id = body.linked_okr_id;

    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "completed") {
        updateData.completed_at = new Date();
      }
    }

    const milestone = await prisma.milestones.update({
      where: { id, tenant_id: tenantId as string },
      data: updateData,
    });

    return c.json(milestone);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return c.json({ error: "Failed to update milestone" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

/** DELETE /:id — Remove milestone */
milestonesRoutes.delete("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");
  const prisma = new PrismaClient();

  try {
    await prisma.milestones.delete({
      where: { id, tenant_id: tenantId as string },
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return c.json({ error: "Failed to delete milestone" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

export default milestonesRoutes;
