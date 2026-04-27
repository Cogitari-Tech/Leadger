import { describe, it, expect, vi } from "vitest";
import app from "../../app";

// Mock supabase to prevent startup errors
vi.mock("../../config/supabase", () => ({
  createScopedClient: (token: string) => ({
    auth: {
      getUser: async () => {
        if (token === "valid-token") {
          return {
            data: {
              user: { id: "user-123", email: "test@leadgers.com" },
            },
            error: null,
          };
        }
        return { data: { user: null }, error: new Error("Invalid token") };
      },
    },
  }),
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              data: [
                {
                  tenant_id: "tenant-aaa",
                  roles: { name: "admin" },
                  status: "active",
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }),
  },
}));

describe("Auth Bypass Tests (OWASP A07)", () => {
  it("should reject requests without Authorization header", async () => {
    const res = await app.request("/api/finance/burn-rate");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Authorization");
  });

  it("should reject requests with malformed Bearer token", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: { Authorization: "Bearer " },
    });
    expect(res.status).toBe(401);
  });

  it("should reject requests with invalid token format", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    expect(res.status).toBe(401);
  });

  it("should reject requests with expired/forged token", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: { Authorization: "Bearer forged-jwt-token-12345" },
    });
    expect(res.status).toBe(401);
  });

  it("should not expose user details in auth error responses", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: { Authorization: "Bearer invalid" },
    });
    const body = await res.json();
    expect(body).not.toHaveProperty("stack");
    expect(body).not.toHaveProperty("user");
    expect(body).not.toHaveProperty("token");
  });
});
