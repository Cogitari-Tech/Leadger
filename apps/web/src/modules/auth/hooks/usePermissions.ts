import { useAuth } from "../context/AuthContext";

/**
 * Hook for checking user permissions.
 *
 * Usage:
 *   const { can, canAny, canAll, hasRole } = usePermissions();
 *   if (can('finance.read')) { ... }
 */
export function usePermissions() {
  const { can, hasRole, permissions, user } = useAuth();

  /**
   * Check if user has ANY of the given permissions
   */
  const canAny = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((p) => can(p));
  };

  /**
   * Check if user has ALL of the given permissions
   */
  const canAll = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((p) => can(p));
  };

  /**
   * Check if user's role hierarchy is >= the given level
   */
  const hasMinLevel = (level: number): boolean => {
    return (user?.role?.hierarchy_level ?? 0) >= level;
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasMinLevel,
    permissions,
    roleName: user?.role?.name ?? null,
    roleLevel: user?.role?.hierarchy_level ?? 0,
  };
}
