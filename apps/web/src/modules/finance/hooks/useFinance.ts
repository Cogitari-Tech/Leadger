import { useState, useEffect, useCallback, useMemo } from "react";
import { useFinanceStore } from "../../../store/financeStore";
import { RecordTransaction } from "@cogitari-platform/core/usecases/finance/RecordTransaction";

import { SupabaseFinanceRepository } from "../repositories/SupabaseFinanceRepository";
import { supabase } from "../../../config/supabase";

/**
 * Hook customizado para operações financeiras
 *
 * Encapsula a lógica de negócio e estado do módulo financeiro.
 * Segue o padrão Facade para simplificar a interface com os componentes.
 */
export function useFinance() {
  const { transactions, accounts, setTransactions, setAccounts } =
    useFinanceStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa repositório (Dependency Injection)
  const repository = useMemo(() => new SupabaseFinanceRepository(supabase), []);

  // Caso de uso
  const recordTransactionUseCase = new RecordTransaction(repository);

  /**
   * Carrega transações do período atual (mês vigente)
   */
  const loadCurrentMonthTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const data = await repository.getTransactionsByPeriod(startDate, endDate);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [repository, setTransactions]);

  /**
   * Carrega o plano de contas
   */
  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await repository.getAllAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Failed to load accounts:", err);
    } finally {
      setLoading(false);
    }
  }, [repository, setAccounts]);

  /**
   * Registra uma nova transação
   */
  const createTransaction = useCallback(
    async (input: {
      date: Date;
      description: string;
      accountDebitId: string;
      accountCreditId: string;
      amount: number;
    }) => {
      setLoading(true);
      setError(null);

      try {
        // Obtém ID do usuário autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Executa caso de uso
        const result = await recordTransactionUseCase.execute({
          ...input,
          userId: user.id,
        });

        // Atualiza estado local
        await loadCurrentMonthTransactions();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao registrar transação";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [recordTransactionUseCase, loadCurrentMonthTransactions],
  );

  /**
   * Calcula resumo financeiro do mês
   */
  const getMonthSummary = useCallback(() => {
    const revenue = transactions
      .filter((t) => {
        const account = accounts.find((a) => a.id === t.accountCreditId);
        return account?.type === "Receita";
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => {
        const account = accounts.find((a) => a.id === t.accountDebitId);
        return account?.type === "Despesa";
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      revenue,
      expenses,
      netIncome: revenue - expenses,
      transactionCount: transactions.length,
    };
  }, [transactions, accounts]);

  /**
   * Busca transações por filtros
   */
  const searchTransactions = useCallback(
    (query: string) => {
      return transactions.filter((t) =>
        t.description.toLowerCase().includes(query.toLowerCase()),
      );
    },
    [transactions],
  );

  /**
   * Busca saldos de contas para relatórios (DRE/Balanço)
   */
  const getAccountBalances = useCallback(
    async (startDate: Date, endDate: Date) => {
      setLoading(true);
      setError(null);
      try {
        return await repository.getAccountBalances(startDate, endDate);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar saldos";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository],
  );

  /**
   * Busca dados da DRE
   */
  const getIncomeStatement = useCallback(
    async (startDate: Date, endDate: Date) => {
      setLoading(true);
      setError(null);
      try {
        return await repository.getIncomeStatement(startDate, endDate);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar DRE";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository],
  );

  /**
   * Busca dados do Balancete
   */
  const getTrialBalance = useCallback(
    async (date: Date) => {
      setLoading(true);
      setError(null);
      try {
        return await repository.getTrialBalance(date);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar Balancete";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository],
  );

  // Carrega dados na montagem do componente
  useEffect(() => {
    loadCurrentMonthTransactions();
    loadAccounts();
  }, [loadCurrentMonthTransactions, loadAccounts]);

  return {
    // Estado
    transactions,
    accounts,
    loading,
    error,

    // Ações
    createTransaction,
    loadCurrentMonthTransactions,
    loadAccounts,
    getAccountBalances,
    getIncomeStatement,
    getTrialBalance,

    // Consultas
    getMonthSummary,
    searchTransactions,

    // Utilidades
    formatCurrency: (value: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value),

    formatDate: (date: Date | string) =>
      new Intl.DateTimeFormat("pt-BR").format(new Date(date)),
  };
}
