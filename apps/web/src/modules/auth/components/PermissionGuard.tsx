import type { ReactNode } from "react";
import { usePermissions } from "../hooks/usePermissions";

interface PermissionGuardProps {
  children: ReactNode;
  requires?: string[];
  requireAll?: boolean;
  minLevel?: number;
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on user permissions.
 *
 * Usage:
 *   <PermissionGuard requires={['finance.read']}>
 *     <FinanceDashboard />
 *   </PermissionGuard>
 */
export function PermissionGuard({
  children,
  requires = [],
  requireAll = false,
  minLevel,
  fallback = null,
}: PermissionGuardProps) {
  const { canAny, canAll, hasMinLevel } = usePermissions();

  // Check hierarchy level first
  if (minLevel !== undefined && !hasMinLevel(minLevel)) {
    return <>{fallback}</>;
  }

  // If no specific permissions required, allow access
  if (requires.length === 0) {
    return <>{children}</>;
  }

  const hasPermission = requireAll ? canAll(requires) : canAny(requires);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
