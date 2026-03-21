import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

export interface CapRound {
  id: string;
  tenant_id: string;
  round_name: string;
  round_type: string;
  pre_money_valuation: number;
  amount_raised: number;
  post_money_valuation: number;
  round_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Shareholder {
  id: string;
  tenant_id: string;
  round_id: string | null;
  shareholder_name: string;
  shareholder_type: string;
  shares_count: number;
  share_price: number;
  ownership_percentage: number;
  investment_amount: number;
  vesting_schedule: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}

export interface SimulationInput {
  roundName: string;
  roundType: string;
  preMoneyValuation: number;
  amountRaised: number;
  newInvestorName: string;
  newInvestorShares: number;
}

export interface DilutionPreview {
  shareholderName: string;
  currentPct: number;
  newPct: number;
  dilution: number;
}

/**
 * Hook para gerenciamento da Cap Table.
 * CRUD de rodadas e acionistas, simulação de diluição.
 */
export function useCapTable() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<CapRound[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRounds = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("cap_table_rounds")
        .select("*")
        .order("round_date", { ascending: true });
      if (err) throw err;
      setRounds(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar rodadas");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadShareholders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("cap_table_shareholders")
        .select("*")
        .order("ownership_percentage", { ascending: false });
      if (err) throw err;
      setShareholders(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar acionistas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createRound = useCallback(
    async (
      input: Omit<
        CapRound,
        "id" | "tenant_id" | "post_money_valuation" | "created_at"
      >,
    ) => {
      setLoading(true);
      try {
        const { data: memberData } = await supabase
          .from("tenant_members")
          .select("tenant_id")
          .eq("user_id", user?.id)
          .single();

        const { data, error: err } = await supabase
          .from("cap_table_rounds")
          .insert({
            ...input,
            tenant_id: memberData?.tenant_id,
            created_by: user?.id,
          })
          .select()
          .single();
        if (err) throw err;
        setRounds((prev) => [...prev, data]);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao criar rodada");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const addShareholder = useCallback(
    async (
      input: Omit<
        Shareholder,
        "id" | "tenant_id" | "created_at" | "updated_at"
      >,
    ) => {
      setLoading(true);
      try {
        const { data: memberData } = await supabase
          .from("tenant_members")
          .select("tenant_id")
          .eq("user_id", user?.id)
          .single();

        const { data, error: err } = await supabase
          .from("cap_table_shareholders")
          .insert({ ...input, tenant_id: memberData?.tenant_id })
          .select()
          .single();
        if (err) throw err;
        setShareholders((prev) => [...prev, data]);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao adicionar acionista",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const deleteShareholder = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from("cap_table_shareholders")
      .delete()
      .eq("id", id);
    if (err) throw err;
    setShareholders((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const deleteRound = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from("cap_table_rounds")
      .delete()
      .eq("id", id);
    if (err) throw err;
    setRounds((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /** Simula diluição ao adicionar uma nova rodada */
  const simulateDilution = useCallback(
    (input: SimulationInput): DilutionPreview[] => {
      const totalCurrentShares = shareholders.reduce(
        (sum, s) => sum + s.shares_count,
        0,
      );
      let newInvestorShares = input.newInvestorShares || 0;

      // Smart calculation: If we have pre-money and amount raised, we calculate exact shares to issue
      if (
        input.preMoneyValuation > 0 &&
        input.amountRaised > 0 &&
        totalCurrentShares > 0
      ) {
        const pricePerShare = input.preMoneyValuation / totalCurrentShares;
        newInvestorShares = input.amountRaised / pricePerShare;
      }

      const newTotalShares = totalCurrentShares + newInvestorShares;

      const previews: DilutionPreview[] = shareholders.map((s) => {
        const currentPct =
          totalCurrentShares > 0
            ? (s.shares_count / totalCurrentShares) * 100
            : 0;
        const newPct =
          newTotalShares > 0 ? (s.shares_count / newTotalShares) * 100 : 0;
        return {
          shareholderName: s.shareholder_name,
          currentPct,
          newPct,
          dilution: currentPct - newPct,
        };
      });

      previews.push({
        shareholderName: input.newInvestorName || "Novo Investidor",
        currentPct: 0,
        newPct:
          newTotalShares > 0 ? (newInvestorShares / newTotalShares) * 100 : 0,
        dilution: 0,
      });

      return previews;
    },
    [shareholders],
  );

  const totalShares = shareholders.reduce((sum, s) => sum + s.shares_count, 0);
  const totalInvested = rounds.reduce((sum, r) => sum + r.amount_raised, 0);
  const latestValuation =
    rounds.length > 0 ? rounds[rounds.length - 1].post_money_valuation : 0;

  useEffect(() => {
    loadRounds();
    loadShareholders();
  }, [loadRounds, loadShareholders]);

  return {
    rounds,
    shareholders,
    loading,
    error,
    totalShares,
    totalInvested,
    latestValuation,
    createRound,
    addShareholder,
    deleteShareholder,
    deleteRound,
    simulateDilution,
    reload: () => {
      loadRounds();
      loadShareholders();
    },
  };
}
