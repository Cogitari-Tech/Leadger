import { useState, useCallback, useEffect } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface BMCData {
  id?: string;
  key_partners: string[];
  key_activities: string[];
  key_resources: string[];
  value_props: string[];
  customer_rels: string[];
  channels: string[];
  customer_segs: string[];
  cost_structure: string[];
  revenue_streams: string[];
}

export function useBMC() {
  const [data, setData] = useState<BMCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBMC = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient<BMCData>("/strategic/bmc");
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBMC = async (payload: Partial<BMCData>) => {
    try {
      setSaving(true);
      const res = await apiClient<BMCData>("/strategic/bmc", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setData(res);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchBMC();
  }, [fetchBMC]);

  return { data, loading, saving, saveBMC };
}
