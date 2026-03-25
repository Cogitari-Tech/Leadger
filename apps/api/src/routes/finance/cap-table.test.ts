import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import capTableRoutes, { calculateVesting } from "./cap-table";
import { AppEnv } from "../../types/env";

const mockFindManyRounds = vi.fn();
const mockFindManyShareholders = vi.fn();
const mockCreateShareholder = vi.fn();

vi.mock("../../middleware/auth", () => ({
  authMiddleware: async (c: any, next: any) => {
    c.set("user", { id: "user-123" });
    await next();
  },
}));

vi.mock("../../middleware/tenancy", () => ({
  tenancyMiddleware: async (c: any, next: any) => {
    c.set("tenantId", "tenant-123");
    await next();
  },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    cap_table_rounds = {
      findMany: mockFindManyRounds,
      create: vi.fn(),
      delete: vi.fn(),
    };
    cap_table_shareholders = {
      findMany: mockFindManyShareholders,
      create: mockCreateShareholder,
      delete: vi.fn(),
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

describe("Cap Table API", () => {
  let app: Hono<AppEnv>;

  beforeEach(() => {
    app = new Hono<AppEnv>();
    app.route("/", capTableRoutes);
    vi.clearAllMocks();
  });

  describe("GET /rounds", () => {
    it("deve retornar lista de rounds", async () => {
      mockFindManyRounds.mockResolvedValue([
        { id: "1", round_name: "Seed", amount_raised: 1000000 },
        { id: "2", round_name: "Series A", amount_raised: 5000000 },
      ]);

      const res = await app.request("/rounds");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(mockFindManyRounds).toHaveBeenCalledWith({
        where: { tenant_id: "tenant-123" },
        orderBy: { round_date: "asc" },
      });
    });
  });

  describe("GET /summary", () => {
    it("deve calcular totalShares e totalInvested corretamente", async () => {
      mockFindManyRounds.mockResolvedValue([
        { amount_raised: 1000, post_money_valuation: 10000 },
        { amount_raised: 2000, post_money_valuation: 30000 },
      ]);
      mockFindManyShareholders.mockResolvedValue([
        { shares_count: 500 },
        { shares_count: 1500 },
      ]);

      const res = await app.request("/summary");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.totalShares).toBe(2000);
      expect(data.totalInvested).toBe(3000);
      expect(data.latestValuation).toBe(30000);
    });

    it("deve retornar 0 se nao houver dados", async () => {
      mockFindManyRounds.mockResolvedValue([]);
      mockFindManyShareholders.mockResolvedValue([]);

      const res = await app.request("/summary");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.totalShares).toBe(0);
      expect(data.totalInvested).toBe(0);
      expect(data.latestValuation).toBe(0);
    });
  });

  describe("GET /shareholders", () => {
    it("deve retornar shareholders com calculated_vesting", async () => {
      mockFindManyShareholders.mockResolvedValue([
        {
          id: "sh-1",
          shareholder_name: "Founder",
          shares_count: 10000,
          vesting_schedule: null,
        },
      ]);

      const res = await app.request("/shareholders");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data[0].calculated_vesting).toBeDefined();
      expect(data[0].calculated_vesting.vested).toBe(10000);
      expect(data[0].calculated_vesting.unvested).toBe(0);
      expect(data[0].calculated_vesting.percentage).toBe(100);
    });
  });

  describe("POST /shareholders - vesting validation", () => {
    it("deve rejeitar cliff >= duration", async () => {
      const res = await app.request("/shareholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareholder_name: "Test",
          shareholder_type: "employee",
          shares_count: 1000,
          share_price: 1,
          ownership_percentage: 5,
          investment_amount: 0,
          vesting_schedule: {
            start_date: "2025-01-01",
            cliff_months: 12,
            duration_months: 12,
          },
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain(
        "cliff_months must be less than duration_months",
      );
    });

    it("deve rejeitar duration negativa", async () => {
      const res = await app.request("/shareholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareholder_name: "Test",
          shareholder_type: "employee",
          shares_count: 1000,
          share_price: 1,
          ownership_percentage: 5,
          investment_amount: 0,
          vesting_schedule: {
            start_date: "2025-01-01",
            cliff_months: 0,
            duration_months: -1,
          },
        }),
      });

      expect(res.status).toBe(400);
    });

    it("deve aceitar vesting_schedule válido", async () => {
      mockCreateShareholder.mockResolvedValue({
        id: "sh-new",
        shareholder_name: "Employee",
        shares_count: 1000,
        vesting_schedule: {
          start_date: "2025-01-01",
          cliff_months: 12,
          duration_months: 48,
        },
      });

      const res = await app.request("/shareholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareholder_name: "Employee",
          shareholder_type: "employee",
          shares_count: 1000,
          share_price: 1,
          ownership_percentage: 5,
          investment_amount: 0,
          vesting_schedule: {
            start_date: "2025-01-01",
            cliff_months: 12,
            duration_months: 48,
          },
        }),
      });

      expect(res.status).toBe(201);
    });

    it("deve aceitar sem vesting_schedule", async () => {
      mockCreateShareholder.mockResolvedValue({
        id: "sh-new",
        shareholder_name: "Investor",
        shares_count: 5000,
      });

      const res = await app.request("/shareholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareholder_name: "Investor",
          shareholder_type: "investor",
          shares_count: 5000,
          share_price: 10,
          ownership_percentage: 25,
          investment_amount: 50000,
        }),
      });

      expect(res.status).toBe(201);
    });
  });
});

// --- Pure function tests for calculateVesting ---

describe("calculateVesting", () => {
  it("deve retornar tudo vested quando não há schedule", () => {
    const result = calculateVesting(10000, null);
    expect(result).toEqual({ vested: 10000, unvested: 0, percentage: 100 });
  });

  it("deve retornar zeros para shares_count = 0", () => {
    const result = calculateVesting(0, {
      start_date: "2025-01-01",
      cliff_months: 12,
      duration_months: 48,
    });
    expect(result).toEqual({ vested: 0, unvested: 0, percentage: 0 });
  });

  it("deve retornar 0 vested antes do cliff", () => {
    // Set start to 6 months ago, cliff is 12 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const result = calculateVesting(12000, {
      start_date: sixMonthsAgo.toISOString(),
      cliff_months: 12,
      duration_months: 48,
    });

    expect(result.vested).toBe(0);
    expect(result.unvested).toBe(12000);
    expect(result.percentage).toBe(0);
  });

  it("deve calcular vesting linear após cliff", () => {
    // Set start 24 months ago, cliff 12, duration 48
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), 1);

    const result = calculateVesting(4800, {
      start_date: twoYearsAgo.toISOString(),
      cliff_months: 12,
      duration_months: 48,
    });

    // 24 months elapsed, 4800/48 * 24 = 2400
    expect(result.vested).toBe(2400);
    expect(result.unvested).toBe(2400);
    expect(result.percentage).toBe(50);
  });

  it("deve retornar 100% vested quando duration excedida", () => {
    // Set start 5 years ago, duration 48 months
    const now = new Date();
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), 1);

    const result = calculateVesting(10000, {
      start_date: fiveYearsAgo.toISOString(),
      cliff_months: 12,
      duration_months: 48,
    });

    expect(result.vested).toBe(10000);
    expect(result.unvested).toBe(0);
    expect(result.percentage).toBe(100);
  });

  it("deve retornar tudo vested para data de inicio inválida", () => {
    const result = calculateVesting(5000, {
      start_date: "invalid-date",
      cliff_months: 12,
      duration_months: 48,
    });
    expect(result).toEqual({ vested: 5000, unvested: 0, percentage: 100 });
  });

  it("deve retornar tudo vested quando schedule está incompleto", () => {
    const result = calculateVesting(5000, {
      start_date: "2025-01-01",
    });
    expect(result).toEqual({ vested: 5000, unvested: 0, percentage: 100 });
  });

  it("deve funcionar com cliff = 0 (sem cliff)", () => {
    // Set start 6 months ago, no cliff, duration 12
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const result = calculateVesting(12000, {
      start_date: sixMonthsAgo.toISOString(),
      cliff_months: 0,
      duration_months: 12,
    });

    // 6 months elapsed, 12000/12 * 6 = 6000
    expect(result.vested).toBe(6000);
    expect(result.unvested).toBe(6000);
    expect(result.percentage).toBe(50);
  });

  it("deve retornar shares negativas = 0", () => {
    const result = calculateVesting(-100, null);
    expect(result).toEqual({ vested: 0, unvested: 0, percentage: 0 });
  });
});
