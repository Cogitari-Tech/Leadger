import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import milestonesRoutes from "./milestones";

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

// Mock dependencies
vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    milestones = {
      findMany: mockFindMany,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

vi.mock("../../middleware/auth", () => ({
  authMiddleware: async (c: any, next: any) => {
    c.set("user", { id: "test-user-id" });
    c.set("userRole", "owner");
    await next();
  },
}));

vi.mock("../../middleware/tenancy", () => ({
  tenancyMiddleware: async (c: any, next: any) => {
    c.set("tenantId", "test-tenant-id");
    await next();
  },
}));

describe("Milestones API", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    // Mount directly on "/" for testing, just like the actual behavior when inside app.route("/strategic/milestones")
    app.route("/", milestonesRoutes);
    vi.clearAllMocks();
  });

  describe("GET /", () => {
    it("should return list of milestones", async () => {
      const mockData = [
        {
          id: "1",
          title: "Launch Beta",
          status: "in_progress",
          category: "product",
          target_date: "2026-06-01",
        },
      ];
      mockFindMany.mockResolvedValue(mockData);

      const res = await app.request("/");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toEqual(mockData);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { tenant_id: "test-tenant-id" },
        orderBy: { target_date: "asc" },
      });
    });

    it("should apply status and category filters", async () => {
      mockFindMany.mockResolvedValue([]);

      const res = await app.request("/?status=planned&category=financial");
      expect(res.status).toBe(200);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          tenant_id: "test-tenant-id",
          status: "planned",
          category: "financial",
        },
        orderBy: { target_date: "asc" },
      });
    });
  });

  describe("POST /", () => {
    it("should create a milestone", async () => {
      const newMilestone = {
        id: "2",
        title: "New Goal",
        status: "planned",
        category: "product",
      };
      mockCreate.mockResolvedValue(newMilestone);

      const res = await app.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Goal" }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(newMilestone);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenant_id: "test-tenant-id",
          title: "New Goal",
          status: "planned",
          category: "product",
          created_by: "test-user-id",
        }),
      });
    });
  });

  describe("PATCH /:id", () => {
    it("should update milestone and set completed_at when status is completed", async () => {
      const updatedMilestone = {
        id: "3",
        title: "Done Goal",
        status: "completed",
      };
      mockUpdate.mockResolvedValue(updatedMilestone);

      const res = await app.request("/3", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updatedMilestone);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "3", tenant_id: "test-tenant-id" },
        data: expect.objectContaining({
          status: "completed",
          completed_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      });
    });
  });

  describe("DELETE /:id", () => {
    it("should delete a milestone", async () => {
      mockDelete.mockResolvedValue({ id: "4" });

      const res = await app.request("/4", { method: "DELETE" });

      expect(res.status).toBe(200);
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: "4", tenant_id: "test-tenant-id" },
      });
    });
  });
});
