import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../../types/env";

const prisma = new PrismaClient();
export const documentsRouter = new Hono<AppEnv>();

// GET /investor/documents -> Lista todos os documentos
documentsRouter.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const documents = await prisma.data_room_documents.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });

    return c.json({ documents });
  } catch (error) {
    console.error("Error fetching data room documents:", error);
    return c.json({ error: "Failed to fetch documents" }, 500);
  }
});

// POST /investor/documents -> Registra metadados de upload
documentsRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      file_path: z.string(),
      file_size: z.number(),
      mime_type: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
  async (c) => {
    const tenantId = c.get("tenantId");
    const user = c.get("user");
    const body = c.req.valid("json");

    try {
      const newDoc = await prisma.data_room_documents.create({
        data: {
          tenant_id: tenantId,
          name: body.name,
          file_path: body.file_path,
          file_size: body.file_size,
          mime_type: body.mime_type,
          category: body.category || "general",
          description: body.description,
          uploaded_by: user.id,
        },
      });

      return c.json({ document: newDoc }, 201);
    } catch (error) {
      console.error("Error registering document:", error);
      return c.json({ error: "Failed to register document" }, 500);
    }
  },
);

// DELETE /investor/documents/:id -> Deleta o metadado (o storage delete é feito no front/via supabase rest trigger)
documentsRouter.delete("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const docId = c.req.param("id");

  try {
    await prisma.data_room_documents.delete({
      where: { id: docId, tenant_id: tenantId },
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Error deleting document:", error);
    return c.json({ error: "Failed to delete document" }, 500);
  }
});
