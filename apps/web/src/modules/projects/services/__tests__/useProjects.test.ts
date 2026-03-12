import { renderHook, waitFor } from "@testing-library/react";
import { useProjects } from "../projects.service";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/config/supabase";

// Mock useAuth
const mockTenant = { id: "test-tenant-id" };
vi.mock("../../../auth/context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    tenant: mockTenant,
  })),
}));

describe("useProjects hook", () => {
  const mockProjects = [
    {
      id: "1",
      name: "Project 1",
      tenant_id: "test-tenant-id",
      status: "active",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a project", async () => {
    const dbProject = {
      id: "2",
      name: "New Project",
      tenant_id: "test-tenant-id",
      description: "Desc",
      status: "active",
      start_date: "2024-01-01",
      end_date: null,
      created_at: "2024-01-01T00:00:00Z",
    };

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: dbProject, error: null }),
    } as any);

    const { result } = renderHook(() => useProjects());

    const expectedProject = {
      id: "2",
      name: "New Project",
      tenantId: "test-tenant-id",
      description: "Desc",
      status: "active",
      startDate: "2024-01-01",
      endDate: null,
      createdAt: "2024-01-01T00:00:00Z",
    };

    const created = await result.current.createProject({
      name: "New Project",
      description: "Desc",
      status: "active",
      startDate: "2024-01-01",
    } as any);

    expect(created).toEqual(expectedProject);
    // Project index matching
    await waitFor(() => {
      expect(result.current.projects).toContainEqual(expectedProject);
    });
  });

  it("should fetch projects", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
    } as any);

    const { result } = renderHook(() => useProjects());

    await result.current.fetchProjects();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.projects).toHaveLength(1);
    });
    expect(result.current.projects[0].name).toBe("Project 1");
    expect(result.current.projects[0].tenantId).toBe("test-tenant-id");
  });
});
