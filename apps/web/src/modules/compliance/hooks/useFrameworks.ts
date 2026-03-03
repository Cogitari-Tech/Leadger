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
      // Map to UI types (mocking progress/status since they aren't on base table)
      const mappedFw: Framework[] = fwData.map((f: any) => ({
        id: f.id,
        name: f.name,
        description: f.description || "",
        version: f.version || "1.0",
        status: "active", // mock
        progress: 0, // mock
        controlsCount: 0,
        compliantCount: 0,
        lastUpdated: new Date(f.created_at).toLocaleDateString(),
      }));
      setFrameworks(mappedFw);

      // Fetch controls if needed ideally here, but since there is no table for that yet in this request, we leave controls empty.
    }
    setLoading(false);
  }, [tenant]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  return { frameworks, controls, loading, fetchFrameworks };
}
