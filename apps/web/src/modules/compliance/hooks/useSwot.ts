import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { SwotItem } from "../types/compliance.types";

export function useSwot() {
  const { tenant } = useAuth();
  const [items, setItems] = useState<SwotItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("swot_items")
      .select("*")
      .order("impact", { ascending: false });

    if (!error && data) {
      setItems(
        data.map((item: any) => ({
          ...item,
          createdAt: item.created_at,
        })) as SwotItem[],
      );
    }
    setLoading(false);
  }, [tenant]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (
    item: Omit<SwotItem, "id" | "createdAt" | "tenant_id">,
  ) => {
    if (!tenant) return;
    const { data, error } = await supabase
      .from("swot_items")
      .insert({
        tenant_id: tenant.id,
        title: item.title,
        description: item.description,
        type: item.type,
        impact: item.impact,
      })
      .select()
      .single();

    if (!error && data) {
      setItems((prev) => [
        ...prev,
        { ...data, createdAt: data.created_at } as unknown as SwotItem,
      ]);
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("swot_items").delete().eq("id", id);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return { items, loading, addItem, removeItem, fetchItems };
}
