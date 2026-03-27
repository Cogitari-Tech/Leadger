import { renderHook, waitFor } from "@testing-library/react";
import { useRisks } from "../useRisks";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/config/supabase";

// Mock useAuth
const mockTenant = { id: "test-tenant-id" };
vi.mock("../../../auth/context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    tenant: mockTenant,
  })),
}));

describe("useRisks hook", () => {
  const mockRisks = [
    { id: "1", title: "Risk 1", created_at: "2024-01-01" },
    { id: "2", title: "Risk 2", created_at: "2024-01-02" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and load risks on mount", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockRisks, error: null }),
    } as any);

    const { result } = renderHook(() => useRisks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.risks).toHaveLength(2);
    expect(result.current.risks[0].title).toBe("Risk 1");
    expect(result.current.risks[0].createdAt).toBe("2024-01-01");
  });

  it("should handle error when fetching risks", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Fetch error" } }),
    } as any);

    const { result } = renderHook(() => useRisks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.risks).toHaveLength(0);
  });

  it("should add a risk via repository", async () => {
    const resultRisk = {
      id: "3",
      title: "New Risk",
      createdAt: "2024-01-03",
      description: "Desc",
      category: "cybersecurity",
      likelihood: 3,
      impact: 4,
      score: 12,
      status: "open",
      owner: "me",
    };

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...resultRisk, created_at: "2024-01-03" },
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useRisks());

    await result.current.addRisk({
      title: "New Risk",
      description: "Desc",
      category: "cybersecurity" as any,
      likelihood: 3,
      impact: 4,
      score: 12,
      status: "open" as any,
      owner: "me",
    });

    await waitFor(() => {
      expect(result.current.risks).toHaveLength(1);
    });
    expect(result.current.risks[0].title).toBe("New Risk");
  });

  it("should remove a risk via repository", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockRisks, error: null }),
      delete: vi.fn().mockReturnThis(),
    } as any);

    const { result } = renderHook(() => useRisks());

    await waitFor(() => expect(result.current.risks).toHaveLength(2));

    await result.current.removeRisk("1");

    await waitFor(() => {
      expect(result.current.risks).toHaveLength(1);
    });
    expect(result.current.risks[0].id).toBe("2");
  });
});
