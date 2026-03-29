import { vi } from "vitest";

// Globally mock @leadgers/core subpaths so PrismaFinanceRepository can load
vi.mock("@leadgers/core/entities/Transaction", () => ({
  Transaction: class {},
}));
vi.mock("@leadgers/core/entities/Account", () => ({ Account: class {} }));
vi.mock("@leadgers/core/repositories/IFinanceRepository", () => ({}));

// Globally mock Supabase config (used by auth middleware)
vi.mock("./config/supabase", () => ({
  createScopedClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error("mock") }),
    },
  }),
}));
