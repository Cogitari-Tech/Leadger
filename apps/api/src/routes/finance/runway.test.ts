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

// Mock PrismaClient as a class (fixes "not a constructor" error)
vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

// Mock PrismaFinanceRepository with controlled data
let mockIncomeData: any = { revenue: 50000, expenses: 80000, details: {} };

vi.mock("../../adapters/PrismaFinanceRepository", () => ({
  PrismaFinanceRepository: class MockRepo {
    getIncomeStatement() {
      return Promise.resolve(mockIncomeData);
    }
  },
}));

import runwayRoutes from "./runway";

describe("Runway Calculator API", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route("/runway", runwayRoutes);
    mockIncomeData = { revenue: 50000, expenses: 80000, details: {} };
  });

  it("calculates runway with correct monthly burn", async () => {
    const res = await app.request("/runway", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cashBalance: 120000,
        projectionMonths: 12,
        scenarios: [
          {
            label: "Base",
            revenueGrowthRate: 0,
            costReductionRate: 0,
            color: "#000",
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.results).toBeDefined();

    const base = json.results[0];
    expect(base.monthlyBurn).toBe(30000);
    expect(base.runwayMonths).toBe(4);
    expect(base.zeroDate).toBeTruthy();
  });

  it("handles profitable scenario (infinite runway)", async () => {
    mockIncomeData = { revenue: 100000, expenses: 80000, details: {} };

    const res = await app.request("/runway", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cashBalance: 50000,
        projectionMonths: 6,
        scenarios: [
          {
            label: "Base",
            revenueGrowthRate: 0,
            costReductionRate: 0,
            color: "#000",
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    const base = json.results[0];

    expect(base.monthlyBurn).toBe(-20000);
    expect(base.runwayMonths).toBe(6);
    expect(base.zeroDate).toBeNull();
  });
});
