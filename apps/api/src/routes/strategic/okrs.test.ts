import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

// Mock middlewares
vi.mock("../../middleware/auth", () => ({
  authMiddleware: async (c: any, next: any) => {
    c.set("tenantId", "test-tenant");
    await next();
  },
}));
vi.mock("../../middleware/tenancy", () => ({
  tenancyMiddleware: async (_c: any, next: any) => {
    await next();
  },
}));

// Mock Data
let mockObjectives: any[] = [];
let mockCreatedObjective: any = null;
let mockUpdatedCount: number = 0;

// Mock PrismaClient as a class (fixes "not a constructor" error)
vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    objectives = {
      findMany: vi.fn(() => Promise.resolve(mockObjectives)),
      create: vi.fn((args: any) =>
        Promise.resolve(mockCreatedObjective || args.data),
      ),
    };
    key_results = {
      updateMany: vi.fn(() => Promise.resolve({ count: mockUpdatedCount })),
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

import okrsRoutes from "./okrs";

describe("OKRs API", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    // Re-initialize app to apply mocks correctly per test
    app.route("/okrs", okrsRoutes);

    // Reset mock data
    mockObjectives = [];
    mockCreatedObjective = null;
    mockUpdatedCount = 0;
  });

  describe("GET /okrs", () => {
    it("returns empty list when no OKRs exist", async () => {
      const res = await app.request("/okrs");
      expect(res.status).toBe(200);
      const json = (await res.json()) as any[];
      expect(json).toEqual([]);
    });

    it("returns objectives with calculated progress based on key results", async () => {
      mockObjectives = [
        {
          id: "obj-1",
          title: "Aumentar Receita",
          key_results: [
            { id: "kr-1", current_val: 50, target_val: 100, weight: 1 }, // 50%
            { id: "kr-2", current_val: 20, target_val: 20, weight: 1 }, // 100%
          ],
        },
      ];

      const res = await app.request("/okrs");
      expect(res.status).toBe(200);
      const json = (await res.json()) as any[];

      expect(json).toHaveLength(1);
      // Average progress: (50 * 1 + 100 * 1) / 2 = 75%
      expect(json[0].progress).toBe(75);
    });

    it("caps KR progress at 100% for calculation", async () => {
      mockObjectives = [
        {
          id: "obj-1",
          title: "Objetivo Sobrecumprido",
          key_results: [
            { id: "kr-1", current_val: 150, target_val: 100, weight: 1 }, // 150% -> capped at 100%
            { id: "kr-2", current_val: 50, target_val: 100, weight: 1 }, // 50%
          ],
        },
      ];

      const res = await app.request("/okrs");
      const json = (await res.json()) as any[];

      // Average progress: (100 * 1 + 50 * 1) / 2 = 75% (not 100%)
      expect(json[0].progress).toBe(75);
    });
  });

  describe("POST /okrs", () => {
    it("creates a new objective with key results", async () => {
      mockCreatedObjective = { id: "new-obj", title: "Test Obj" };

      const res = await app.request("/okrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Obj",
          target_date: "2025-12-31",
          key_results: [{ title: "KR 1", target_val: 100, unit: "%" }],
        }),
      });

      expect(res.status).toBe(201);
      const json = (await res.json()) as any;
      expect(json.id).toBe("new-obj");
    });
  });

  describe("PUT /okrs/:objectiveId/kr/:krId", () => {
    it("updates key result current value", async () => {
      mockUpdatedCount = 1;

      const res = await app.request("/okrs/obj-1/kr/kr-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_val: 75,
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.updated).toBe(1);
    });
  });
});
