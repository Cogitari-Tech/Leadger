import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { Framework, Control } from "../types/compliance.types";

export function useFrameworks() {
  const { tenant } = useAuth();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [controls] = useState<Record<string, Control[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchFrameworks = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);

    // Fetch frameworks
    const { data: fwData, error: fwError } = await supabase
      .from("audit_frameworks")
      .select("*")
      .eq("tenant_id", tenant.id);

    if (!fwError && fwData) {
      // Fetch programs for these frameworks to link with checklists
      const { data: programsData } = await supabase
        .from("audit_programs")
        .select("id, framework_id")
        .eq("tenant_id", tenant.id);

      // Fetch all checklists for tenant
      const { data: checklistData } = await supabase
        .from("audit_program_checklists")
        .select("status, audit_program_id")
        .eq("tenant_id", tenant.id);

      // Map to UI types
      const mappedFw: Framework[] = fwData.map((f: any) => {
        const fwPrograms =
          programsData?.filter((p) => p.framework_id === f.id) || [];
        const programIds = fwPrograms.map((p) => p.id);

        const fwChecklists =
          checklistData?.filter((c) =>
            programIds.includes(c.audit_program_id),
          ) || [];
        const total = fwChecklists.length;
        const compliant = fwChecklists.filter(
          (c) => c.status === "compliant",
        ).length;
        const progress = total > 0 ? Math.round((compliant / total) * 100) : 0;
        let status: Framework["status"] = "pending";
        if (progress >= 100) status = "compliant";
        else if (progress > 0) status = "partial";

        return {
          id: f.id,
          name: f.name,
          description: f.description || "",
          version: f.version || "1.0",
          status: status,
          progress,
          controlsCount: total,
          compliantCount: compliant,
          lastUpdated: new Date(f.created_at).toLocaleDateString(),
        };
      });
      setFrameworks(mappedFw);
    }
    setLoading(false);
  }, [tenant]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  return { frameworks, controls, loading, fetchFrameworks };
}
