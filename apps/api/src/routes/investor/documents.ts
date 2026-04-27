import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { fileUploadGuard } from "../../middleware/file-upload";
import { uploadBodyLimit } from "../../middleware/body-limit";
import { AppEnv } from "../../types/env";

export const documentsRouter = new Hono<AppEnv>();

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

// Metadata registration with strict validation
documentsRouter.post(
  "/",
  uploadBodyLimit(),
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).max(300).trim(),
      file_path: z.string().min(1).max(1000),
      file_size: z.number().int().positive().max(10_485_760),
      mime_type: z.string().min(1).max(100),
      category: z.string().max(100).optional(),
      description: z.string().max(2000).optional(),
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

// Upload endpoint with full file validation (MIME + Magic Bytes)
documentsRouter.post(
  "/upload",
  uploadBodyLimit(),
  fileUploadGuard(),
  async (c) => {
    const tenantId = c.get("tenantId");
    const user = c.get("user");
    const validatedFiles = c.get("validatedFiles") as
      | Array<{ name: string; file: File }>
      | undefined;

    if (!validatedFiles || validatedFiles.length === 0) {
      return c.json({ error: "No files provided" }, 400);
    }

    try {
      const results = [];

      for (const { file } of validatedFiles) {
        const newDoc = await prisma.data_room_documents.create({
          data: {
            tenant_id: tenantId,
            name: file.name,
            file_path: `uploads/${tenantId}/${Date.now()}-${file.name}`,
            file_size: file.size,
            mime_type: file.type,
            category: "general",
            uploaded_by: user.id,
          },
        });
        results.push(newDoc);
      }

      return c.json({ documents: results }, 201);
    } catch (error) {
      console.error("Error uploading documents:", error);
      return c.json({ error: "Failed to upload documents" }, 500);
    }
  },
);

documentsRouter.delete("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const docId = c.req.param("id");

  try {
    const existing = await prisma.data_room_documents.findFirst({
      where: { id: docId, tenant_id: tenantId },
    });

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    await prisma.data_room_documents.delete({
      where: { id: docId, tenant_id: tenantId },
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Error deleting document:", error);
    return c.json({ error: "Failed to delete document" }, 500);
  }
});
