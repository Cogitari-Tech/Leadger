import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

export interface ProjectRiskScore {
  project_id: string;
  project_name: string;
  project_status: string;
  tenant_id: string;
  open_findings: number;
  critical_findings: number;
  open_vulns: number;
  critical_vulns: number;
  non_compliant_items: number;
  risk_score: number;
  risk_level: "critical" | "high" | "medium" | "low";
}

export function useProjectRiskScores() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id;
  const [scores, setScores] = useState<ProjectRiskScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    async function fetchScores() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from("v_project_risk_scores")
          .select("*")
          .eq("tenant_id", tenantId)
          .order("risk_score", { ascending: false });

        if (queryError) throw queryError;

        setScores((data as ProjectRiskScore[]) || []);
      } catch (err: any) {
        console.error("Risk scores fetch error:", err);
        setError(err.message || "Erro ao carregar risk scores.");
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [tenantId]);

  return { scores, loading, error };
}
