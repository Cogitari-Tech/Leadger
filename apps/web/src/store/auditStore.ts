import { create } from "zustand";
import type {
  AuditProgram,
  AuditFramework,
  AuditFinding,
  AuditActionPlan,
} from "../modules/audit/types/audit.types";

interface AuditState {
  programs: AuditProgram[];
  frameworks: AuditFramework[];
  findings: AuditFinding[];
  actionPlans: AuditActionPlan[];

  setPrograms: (programs: AuditProgram[]) => void;
  setFrameworks: (frameworks: AuditFramework[]) => void;
  setFindings: (findings: AuditFinding[]) => void;
  setActionPlans: (actionPlans: AuditActionPlan[]) => void;

  addProgram: (program: AuditProgram) => void;
  updateProgram: (id: string, data: Partial<AuditProgram>) => void;
  removeProgram: (id: string) => void;

  addFinding: (finding: AuditFinding) => void;
  updateFinding: (id: string, data: Partial<AuditFinding>) => void;

  addActionPlan: (plan: AuditActionPlan) => void;
  updateActionPlan: (id: string, data: Partial<AuditActionPlan>) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  programs: [],
  frameworks: [],
  findings: [],
  actionPlans: [],

  setPrograms: (programs) => set({ programs }),
  setFrameworks: (frameworks) => set({ frameworks }),
  setFindings: (findings) => set({ findings }),
  setActionPlans: (actionPlans) => set({ actionPlans }),

  addProgram: (program) => set((s) => ({ programs: [program, ...s.programs] })),
  updateProgram: (id, data) =>
    set((s) => ({
      programs: s.programs.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
  removeProgram: (id) =>
    set((s) => ({ programs: s.programs.filter((p) => p.id !== id) })),

  addFinding: (finding) => set((s) => ({ findings: [finding, ...s.findings] })),
  updateFinding: (id, data) =>
    set((s) => ({
      findings: s.findings.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),

  addActionPlan: (plan) =>
    set((s) => ({ actionPlans: [plan, ...s.actionPlans] })),
  updateActionPlan: (id, data) =>
    set((s) => ({
      actionPlans: s.actionPlans.map((p) =>
        p.id === id ? { ...p, ...data } : p,
      ),
    })),
}));
