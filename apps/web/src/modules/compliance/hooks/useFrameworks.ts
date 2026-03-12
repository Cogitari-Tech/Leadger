import { useState, useCallback, useEffect, useMemo } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { Framework, Control } from "../types/compliance.types";
import { SupabaseComplianceRepository } from "../repositories/SupabaseComplianceRepository";

export function useFrameworks() {
  const { tenant } = useAuth();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [controls, setControls] = useState<Record<string, Control[]>>({});
  const [loading, setLoading] = useState(true);

  const repository = useMemo(
    () => new SupabaseComplianceRepository(supabase),
    [],
  );

  const fetchFrameworks = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);

    try {
      // 1. Fetch frameworks using repository
      const mappedFw = await repository.listFrameworks(tenant.id);
      setFrameworks(mappedFw as unknown as Framework[]);

      if (mappedFw.length > 0) {
        const frameworkIds = mappedFw.map((f) => f.id);

        // 2. Fetch programs for these frameworks
        const programsData = await repository.listProgramsForFrameworks(
          tenant.id,
          frameworkIds,
        );
        const programIds = programsData?.map((p) => p.id) || [];

        // 3. Fetch checklists using repository
        const checklistData =
          await repository.listChecklistsForPrograms(programIds);

        // 4. Fetch controls using repository
        const controlsData = await repository.listControls(frameworkIds);

        // 5. Map Controls
        const mappedControls: Record<string, Control[]> = {};
        mappedFw.forEach((f) => {
          mappedControls[f.id] = [];
        });

        controlsData?.forEach((c: any) => {
          const relevantChecklists = checklistData.filter(
            (chk: any) => chk.control_id === c.id,
          );

          let controlStatus: Control["status"] = "evaluating";
          if (relevantChecklists.length > 0) {
            if (
              relevantChecklists.some(
                (chk: any) => chk.status === "non_compliant",
              )
            ) {
              controlStatus = "non_compliant";
            } else if (
              relevantChecklists.every(
                (chk: any) => chk.status === "not_applicable",
              )
            ) {
              controlStatus = "not_applicable";
            } else if (
              relevantChecklists.every((chk: any) => chk.status === "compliant")
            ) {
              controlStatus = "compliant";
            } else {
              controlStatus = "evaluating";
            }
          }

          if (mappedControls[c.framework_id]) {
            mappedControls[c.framework_id].push({
              id: c.id,
              frameworkId: c.framework_id,
              code: c.code,
              title: c.title,
              description: c.description || "",
              status: controlStatus,
            });
          }
        });

        setControls(mappedControls);
      } else {
        setFrameworks([]);
        setControls({});
      }
    } catch (error) {
      console.error("Error fetching frameworks:", error);
    } finally {
      setLoading(false);
    }
  }, [tenant, repository]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  return { frameworks, controls, loading, fetchFrameworks };
}
