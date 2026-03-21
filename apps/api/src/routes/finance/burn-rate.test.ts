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

// Mock PrismaClient as a class
vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

// Mock PrismaFinanceRepository
const mockIncomeData = {
  revenue: 10000,
  expenses: 12000,
  details: {
    expensesByCategory: { Folha_Pagamento: 8000, Marketing: 4000 },
  },
};

vi.mock("../../adapters/PrismaFinanceRepository", () => ({
  PrismaFinanceRepository: class MockRepo {
    getIncomeStatement() {
      return Promise.resolve(mockIncomeData);
    }
  },
}));

import burnRateRoutes from "./burn-rate";

describe("Burn Rate API", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route("/burn-rate", burnRateRoutes);
  });

  it("returns correct gross/net burn and breakdown", async () => {
    const res = await app.request("/burn-rate?months=6");

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;

    expect(json.grossBurn).toBe(12000);
    expect(json.netBurn).toBe(2000);
    expect(json.breakdown).toHaveLength(2);
    expect(json.breakdown[0].category).toBe("Folha_Pagamento");
    expect(json.breakdown[0].amount).toBe(8000);
  });
});
