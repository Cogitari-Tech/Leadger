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

import unitEconomicsRoutes from "./unit-economics";

describe("Unit Economics API", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route("/unit-economics", unitEconomicsRoutes);
  });

  it("returns valid LTV/CAC ratios and alerts", async () => {
    const res = await app.request("/unit-economics");

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;

    expect(json.ltv).toBe(6000);
    expect(json.cac).toBe(1500);
    expect(json.ltvCacRatio).toBe(4);
    expect(json.paybackMonths).toBe(3);

    expect(json.alerts).toHaveLength(1);
    expect(json.alerts[0].type).toBe("green");
    expect(json.alerts[0].message).toContain("excelente");
  });
});
