import { useState, useCallback, useEffect, useMemo } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { SwotItem } from "../types/compliance.types";
import { SupabaseComplianceRepository } from "../repositories/SupabaseComplianceRepository";

export function useSwot() {
  const { tenant } = useAuth();
  const [items, setItems] = useState<SwotItem[]>([]);
  const [loading, setLoading] = useState(true);

  const repository = useMemo(
    () => new SupabaseComplianceRepository(supabase),
    [],
  );

  const fetchItems = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);

    try {
      const data = await repository.listItems(tenant.id);
      setItems(data as unknown as SwotItem[]);
    } catch (error) {
      console.error("Error fetching SWOT items:", error);
    } finally {
      setLoading(false);
    }
  }, [tenant, repository]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (
    item: Omit<SwotItem, "id" | "createdAt" | "tenant_id">,
  ) => {
    if (!tenant) return;

    try {
      const data = await repository.addItem(tenant.id, item as any);
      setItems((prev) => [...prev, data as unknown as SwotItem]);
    } catch (error) {
      console.error("Error adding SWOT item:", error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await repository.removeItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error removing SWOT item:", error);
    }
  };

  return { items, loading, addItem, removeItem, fetchItems };
}
