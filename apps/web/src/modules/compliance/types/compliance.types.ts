export interface Framework {
  id: string;
  name: string;
  description: string;
  version: string;
  status:
    | "active"
    | "archived"
    | "evaluating"
    | "compliant"
    | "partial"
    | "pending";
  progress: number; // 0 to 100
  controlsCount: number;
  compliantCount: number;
  lastUpdated: string;
}

export interface Control {
  id: string;
  frameworkId: string;
  code: string;
  title: string;
  description: string;
  status: "compliant" | "non_compliant" | "not_applicable" | "evaluating";
  evidence?: string;
  owner?: string;
}

export type SwotType = "strength" | "weakness" | "opportunity" | "threat";

export interface SwotItem {
  id: string;
  type: SwotType;
  title: string;
  description: string;
  impact: number; // 1 to 5
  createdAt: string;
}

export type RiskLikelihood = 1 | 2 | 3 | 4 | 5;
export type RiskImpact = 1 | 2 | 3 | 4 | 5;

export interface RiskEntry {
  id: string;
  title: string;
  description: string;
  category:
    | "operational"
    | "financial"
    | "strategic"
    | "compliance"
    | "cybersecurity";
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  score: number;
  status: "open" | "mitigated" | "accepted" | "transferred";
  mitigationPlan?: string;
  owner?: string;
  createdAt: string;
}
