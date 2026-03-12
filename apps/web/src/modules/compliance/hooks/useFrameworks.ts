import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { Framework, Control } from "../types/compliance.types";

export function useFrameworks() {
  const { tenant } = useAuth();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [controls, setControls] = useState<Record<string, Control[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchFrameworks = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);

    // Fetch frameworks
    const { data: fwData, error: fwError } = await supabase
      .from("audit_frameworks")
      .select("*")
      .eq("tenant_id", tenant.id);

    if (!fwError && fwData && fwData.length > 0) {
      const frameworkIds = fwData.map((f: any) => f.id);

      // Fetch programs for these frameworks to link with checklists
      const { data: programsData } = await supabase
        .from("audit_programs")
        .select("id, framework_id")
        .eq("tenant_id", tenant.id)
        .in("framework_id", frameworkIds);

      const programIds = programsData?.map((p) => p.id) || [];

      // Fetch all checklists for these programs
      let checklistData: any[] = [];
      if (programIds.length > 0) {
        const { data } = await supabase
          .from("audit_program_checklists")
          .select("status, program_id, control_id")
          .in("program_id", programIds);
        checklistData = data || [];
      }

      // Fetch controls for these frameworks
      const { data: controlsData } = await supabase
        .from("audit_framework_controls")
        .select("*")
        .in("framework_id", frameworkIds);

      // Map Controls
      const mappedControls: Record<string, Control[]> = {};
      fwData.forEach((f: any) => {
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
            controlStatus = "evaluating"; // fallback for mixed (e.g. pending + compliant)
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

      // Map to UI types
      const mappedFw: Framework[] = fwData.map((f: any) => {
        const fwPrograms =
          programsData?.filter((p) => p.framework_id === f.id) || [];
        const fProgramIds = fwPrograms.map((p) => p.id);

        const fwChecklists =
          checklistData.filter((c) => fProgramIds.includes(c.program_id)) || [];
        const total = fwChecklists.length || mappedControls[f.id]?.length || 0;
        const compliant = fwChecklists.filter(
          (c) => c.status === "compliant",
        ).length;
        const progress = total > 0 ? Math.round((compliant / total) * 100) : 0;
        let status: Framework["status"] = "pending";
        if (progress >= 100) status = "compliant";
        else if (progress > 0) status = "partial";

        // Ativo se já tem algum checklist para ele
        if (total > 0 && status === "pending") status = "active";

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
    } else {
      setFrameworks([]);
      setControls({});
    }
    setLoading(false);
  }, [tenant]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  return { frameworks, controls, loading, fetchFrameworks };
}
