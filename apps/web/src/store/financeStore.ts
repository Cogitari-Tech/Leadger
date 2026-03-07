import { create } from "zustand";
import { Transaction } from "@leadgers/core/entities/Transaction";
import { Account } from "@leadgers/core/entities/Account";

interface FinanceState {
  transactions: Transaction[];
  accounts: Account[];
  addTransaction: (transaction: Transaction) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAccounts: (accounts: Account[]) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: [],
  accounts: [],
  addTransaction: (transaction: Transaction) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),
  setTransactions: (transactions: Transaction[]) => set({ transactions }),
  setAccounts: (accounts: Account[]) => set({ accounts }),
}));
