import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

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

export interface VestingSchedule {
  start_date?: string;
  cliff_months?: number;
  duration_months?: number;
}

export interface Shareholder {
  id: string;
  tenant_id: string;
  round_id: string | null;
  shareholder_name: string;
  shareholder_type: string;
  shares_count: number | string;
  share_price: number | string;
  ownership_percentage: number;
  investment_amount: number | string;
  vesting_schedule: VestingSchedule | null;
  notes: string | null;
  created_at: string;
  calculated_vesting?: {
    vested: number;
    unvested: number;
    percentage: number;
  };
}

export interface Summary {
  totalShares: number;
  totalInvested: number;
  latestValuation: number;
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
 * Hook para gerenciamento da Cap Table via API REST.
 * CRUD de rodadas e acionistas, simulação de diluição.
 */
export function useCapTable() {
  const [rounds, setRounds] = useState<CapRound[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [roundsData, shareholdersData, summaryData] = await Promise.all([
        apiClient.get<CapRound[]>("/finance/cap-table/rounds"),
        apiClient.get<Shareholder[]>("/finance/cap-table/shareholders"),
        apiClient.get<Summary>("/finance/cap-table/summary"),
      ]);
      setRounds(roundsData || []);
      setShareholders(shareholdersData || []);
      setSummary(summaryData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados da Cap Table",
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
        const data = await apiClient.post<CapRound>(
          "/finance/cap-table/rounds",
          input,
        );
        setRounds((prev) => [...prev, data]);
        // Update summary as well if you want or re-trigger load
        loadData();
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao criar rodada");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadData],
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
        const data = await apiClient.post<Shareholder>(
          "/finance/cap-table/shareholders",
          input,
        );
        setShareholders((prev) => [...prev, data]);
        loadData();
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
    [loadData],
  );

  const deleteShareholder = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/finance/cap-table/shareholders/${id}`);
        setShareholders((prev) => prev.filter((s) => s.id !== id));
        loadData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao remover acionista",
        );
        throw err;
      }
    },
    [loadData],
  );

  const deleteRound = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/finance/cap-table/rounds/${id}`);
        setRounds((prev) => prev.filter((r) => r.id !== id));
        loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao remover rodada");
        throw err;
      }
    },
    [loadData],
  );

  /** Simula diluição ao adicionar uma nova rodada */
  const simulateDilution = useCallback(
    (input: SimulationInput): DilutionPreview[] => {
      let currentTotalShares = totalShares;
      // Convert possible object from decimal
      if (typeof currentTotalShares !== "number") {
        currentTotalShares = Number(summary?.totalShares) || 0;
      }

      let newInvestorShares = input.newInvestorShares || 0;

      // Smart calculation: If we have pre-money and amount raised, we calculate exact shares to issue
      if (
        input.preMoneyValuation > 0 &&
        input.amountRaised > 0 &&
        currentTotalShares > 0
      ) {
        const pricePerShare = input.preMoneyValuation / currentTotalShares;
        newInvestorShares = input.amountRaised / pricePerShare;
      }

      const newTotalShares = currentTotalShares + newInvestorShares;

      const previews: DilutionPreview[] = shareholders.map((s) => {
        const shareCountStr =
          typeof s.shares_count === "string"
            ? parseFloat(s.shares_count)
            : s.shares_count;
        const currentPct =
          currentTotalShares > 0
            ? (shareCountStr / currentTotalShares) * 100
            : 0;
        const newPct =
          newTotalShares > 0 ? (shareCountStr / newTotalShares) * 100 : 0;
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
    [shareholders, summary],
  );

  const totalShares =
    summary?.totalShares ||
    shareholders.reduce((sum, s) => sum + Number(s.shares_count), 0);
  const totalInvested =
    summary?.totalInvested ||
    rounds.reduce((sum, r) => sum + Number(r.amount_raised), 0);
  const latestValuation =
    summary?.latestValuation ||
    (rounds.length > 0
      ? Number(rounds[rounds.length - 1].post_money_valuation)
      : 0);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    reload: loadData,
  };
}
