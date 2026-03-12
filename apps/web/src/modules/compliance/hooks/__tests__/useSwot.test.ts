import { renderHook, waitFor } from "@testing-library/react";
import { useSwot } from "../useSwot";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "../../../../config/supabase";

const mockTenant = { id: "test-tenant-id" };
vi.mock("../../../auth/context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    tenant: mockTenant,
  })),
}));

describe("useSwot hook", () => {
  const mockItems = [
    {
      id: "1",
      type: "strength",
      title: "Item 1",
      description: "Desc 1",
      impact: 4,
      created_at: "2024-01-01",
    },
    {
      id: "2",
      type: "weakness",
      title: "Item 2",
      description: "Desc 2",
      impact: 3,
      created_at: "2024-01-02",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and load SWOT items on mount", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
    } as any);

    const { result } = renderHook(() => useSwot());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].title).toBe("Item 1");
    expect(result.current.items[0].createdAt).toBe("2024-01-01");
  });

  it("should handle error when fetching SWOT items", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Fetch error" } }),
    } as any);

    const { result } = renderHook(() => useSwot());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("should add a SWOT item via repository", async () => {
    const newItem = {
      id: "3",
      type: "opportunity",
      title: "New Item",
      description: "New Desc",
      impact: 5,
      createdAt: "2024-01-03",
    };

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...newItem, created_at: "2024-01-03" },
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useSwot());

    await result.current.addItem({
      type: "opportunity" as any,
      title: "New Item",
      description: "New Desc",
      impact: 5,
    } as any);

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });
    expect(result.current.items[0].title).toBe("New Item");
  });

  it("should remove a SWOT item via repository", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
      delete: vi.fn().mockReturnThis(),
    } as any);

    const { result } = renderHook(() => useSwot());

    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await result.current.removeItem("1");

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });
    expect(result.current.items[0].id).toBe("2");
  });
});
