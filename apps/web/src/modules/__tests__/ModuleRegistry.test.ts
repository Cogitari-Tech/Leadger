import { describe, it, expect, vi, beforeEach } from "vitest";
import { moduleRegistry, ModuleConfig } from "../registry";

describe("ModuleRegistry", () => {
  const mockModule: ModuleConfig = {
    id: "test-module",
    name: "Test Module",
    description: "A test module",
    icon: "test-icon",
    version: "1.0.0",
    permissions: ["test:read"],
    routes: [{ path: "/test", element: null }],
    navigation: [{ label: "Test", path: "/test", icon: "test-icon" }],
    settings: {},
    onModuleLoad: vi.fn(),
    onModuleUnload: vi.fn(),
  };

  beforeEach(() => {
    // Need to unregister to avoid singleton pollution between tests
    moduleRegistry.unregister("test-module");
    vi.clearAllMocks();
  });

  it("should register a module correctly", () => {
    moduleRegistry.register(mockModule);
    const registered = moduleRegistry.get("test-module");
    expect(registered).toEqual(mockModule);
  });

  it("should load a module and call its onModuleLoad hook", async () => {
    moduleRegistry.register(mockModule);
    await moduleRegistry.load("test-module");
    expect(mockModule.onModuleLoad).toHaveBeenCalled();
  });

  it("should identify accessible modules based on permissions", () => {
    moduleRegistry.register(mockModule);

    expect(moduleRegistry.hasPermission("test-module", ["test:read"])).toBe(
      true,
    );
    expect(
      moduleRegistry.hasPermission("test-module", ["other:permission"]),
    ).toBe(false);
  });

  it("should collect navigation from all modules", () => {
    moduleRegistry.register(mockModule);
    const nav = moduleRegistry.getAllNavigation();

    const testNav = nav.find((n) => n.module === "Test Module");
    expect(testNav).toBeDefined();
    expect(testNav?.items).toEqual(mockModule.navigation);
  });

  it("should unregister a module and call its onModuleUnload hook", async () => {
    moduleRegistry.register(mockModule);
    await moduleRegistry.load("test-module");
    moduleRegistry.unregister("test-module");

    expect(mockModule.onModuleUnload).toHaveBeenCalled();
    expect(moduleRegistry.get("test-module")).toBeUndefined();
  });
});
