import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { validateBody } from "../../middleware/validate";
import { createHeadcountSchema, updateHeadcountSchema } from "../../schemas";
import { AppEnv } from "../../types/env";

const headcountRoutes = new Hono<AppEnv>();

headcountRoutes.use("*", authMiddleware);
headcountRoutes.use("*", tenancyMiddleware);

headcountRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const plans = await prisma.headcount_plans.findMany({
      where: { tenant_id: tenantId },
      orderBy: { expected_start_date: "asc" },
    });

    return c.json({ plans });
  } catch (error) {
    console.error("Error fetching headcount plans:", error);
    return c.json({ error: "Failed to fetch headcount plans." }, 500);
  }
});

headcountRoutes.post("/", validateBody(createHeadcountSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const body = c.get("validatedBody");

  try {
    const plan = await prisma.headcount_plans.create({
      data: {
        tenant_id: tenantId,
        role_title: body.role_title,
        department: body.department,
        monthly_salary: body.monthly_salary,
        expected_start_date: new Date(body.expected_start_date),
        status: body.status,
        notes: body.notes,
        created_by: null,
      },
    });

    return c.json({ plan }, 201);
  } catch (error) {
    console.error("Error creating headcount plan:", error);
    return c.json({ error: "Failed to create headcount plan." }, 500);
  }
});

headcountRoutes.patch(
  "/:id",
  validateBody(updateHeadcountSchema),
  async (c) => {
    const tenantId = c.get("tenantId");
    const id = c.req.param("id");
    const body = c.get("validatedBody");

    try {
      const existing = await prisma.headcount_plans.findFirst({
        where: { id, tenant_id: tenantId },
      });

      if (!existing) {
        return c.json({ error: "Plan not found." }, 404);
      }

      const updated = await prisma.headcount_plans.update({
        where: { id },
        data: {
          role_title: body.role_title ?? undefined,
          department: body.department ?? undefined,
          monthly_salary: body.monthly_salary ?? undefined,
          expected_start_date: body.expected_start_date
            ? new Date(body.expected_start_date)
            : undefined,
          status: body.status ?? undefined,
          notes: body.notes ?? undefined,
        },
      });

      return c.json({ plan: updated });
    } catch (error) {
      console.error("Error updating headcount plan:", error);
      return c.json({ error: "Failed to update headcount plan." }, 500);
    }
  },
);

headcountRoutes.delete("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");

  try {
    const existing = await prisma.headcount_plans.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!existing) {
      return c.json({ error: "Plan not found." }, 404);
    }

    await prisma.headcount_plans.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting headcount plan:", error);
    return c.json({ error: "Failed to delete headcount plan." }, 500);
  }
});

export default headcountRoutes;
