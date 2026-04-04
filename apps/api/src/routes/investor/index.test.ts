import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";

// Mock PrismaClient as a class (must come before importing the router)
vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    investor_updates = {
      findMany: vi.fn().mockResolvedValue([]),
    };
    data_room_documents = {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: "doc-1" }),
      delete: vi.fn().mockResolvedValue({}),
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

vi.mock("../../jobs/queue", () => ({
  inngest: {
    send: vi.fn(),
  },
}));

// Mock auth middleware so tenantId / user are set in context
vi.mock("../../middleware/auth", () => ({
  authMiddleware: async (c: any, next: any) => {
    c.set("tenantId", "test-tenant");
    c.set("user", { id: "test-user" });
    await next();
  },
}));
vi.mock("../../middleware/tenancy", () => ({
  tenancyMiddleware: async (_c: any, next: any) => {
    await next();
  },
}));

import investorRouter from "./index";

describe("Investor Routes", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    // Simulate auth context for all requests
    app.use("*", async (c, next) => {
      c.set("tenantId" as any, "test-tenant");
      c.set("user" as any, { id: "test-user" });
      await next();
    });
    app.route("/investor", investorRouter);
  });

  it("GET /investor/updates should return investor updates", async () => {
    const res = await app.request("/investor/updates");
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json).toHaveProperty("data");
  });

  it("POST /investor/reports/generate should queue generation", async () => {
    const res = await app.request("/investor/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "test-tenant", type: "monthly" }),
    });
    expect(res.status).toBe(202);
    const json = (await res.json()) as any;
    expect(json.status).toBe("queued");
    expect(json).toHaveProperty("reportId");
  });

  it("GET /investor/documents should return documents list", async () => {
    const res = await app.request("/investor/documents");
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json).toHaveProperty("documents");
  });
});
