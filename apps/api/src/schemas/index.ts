import { z } from "zod";

// ─── OKRs ────────────────────────────────────────────────

export const createOkrSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(2000).optional(),
  target_date: z.string().datetime({ offset: true }).or(z.string().min(1)),
  key_results: z
    .array(
      z.object({
        title: z.string().min(1).max(300),
        target_val: z.number().positive(),
        unit: z.string().min(1).max(50),
        weight: z.number().positive().default(1),
      }),
    )
    .min(1, "At least one key result is required"),
});

export const updateKeyResultSchema = z.object({
  current_val: z.number().nonnegative(),
});

// ─── Milestones ──────────────────────────────────────────

export const createMilestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(2000).optional(),
  target_date: z.string().optional(),
  status: z
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .default("planned"),
  category: z
    .enum([
      "product",
      "engineering",
      "legal",
      "finance",
      "operations",
      "marketing",
    ])
    .default("product"),
  linked_okr_id: z.string().uuid().optional().nullable(),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

// ─── North Star ──────────────────────────────────────────

export const createNorthStarSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  target_value: z.number().optional(),
  current_value: z.number().optional(),
  unit: z.string().max(50).optional(),
});

// ─── BMC ─────────────────────────────────────────────────

const bmcArrayField = z.array(z.any()).default([]);

export const updateBmcSchema = z.object({
  key_partners: bmcArrayField.optional(),
  key_activities: bmcArrayField.optional(),
  key_resources: bmcArrayField.optional(),
  value_props: bmcArrayField.optional(),
  customer_rels: bmcArrayField.optional(),
  channels: bmcArrayField.optional(),
  customer_segs: bmcArrayField.optional(),
  cost_structure: bmcArrayField.optional(),
  revenue_streams: bmcArrayField.optional(),
});

// ─── Sales Deals ─────────────────────────────────────────

export const createDealSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  client_name: z.string().max(200).optional(),
  value: z.number().nonnegative().default(0),
  mrr_amount: z.number().nonnegative().optional().nullable(),
  stage: z
    .enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"])
    .default("lead"),
  expected_close_date: z.string().optional().nullable(),
  probability: z.number().min(0).max(100).default(0),
  type: z.enum(["new_business", "upsell", "renewal"]).default("new_business"),
  recurrence: z.enum(["one_time", "monthly", "annual"]).default("one_time"),
  notes: z.string().max(5000).optional().nullable(),
});

export const updateDealSchema = createDealSchema.partial();

export const createMrrSnapshotSchema = z.object({
  month_date: z.string().min(1, "month_date is required"),
  total_mrr: z.number().nonnegative().default(0),
  total_arr: z.number().nonnegative().default(0),
  new_mrr: z.number().nonnegative().default(0),
  expansion_mrr: z.number().nonnegative().default(0),
  churn_mrr: z.number().nonnegative().default(0),
  contraction_mrr: z.number().nonnegative().default(0),
});

// ─── Product Roadmap ─────────────────────────────────────

export const createRoadmapSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(2000).optional().nullable(),
  status: z
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .default("planned"),
  quarter: z.string().max(10).optional(),
  github_issue_id: z.string().optional().nullable(),
  github_issue_url: z.string().url().optional().nullable(),
  key_result_id: z.string().uuid().optional().nullable(),
  milestone_id: z.string().uuid().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

export const updateRoadmapSchema = createRoadmapSchema.partial();

// ─── People Headcount ────────────────────────────────────

export const createHeadcountSchema = z.object({
  role_title: z.string().min(1, "Role title is required").max(200),
  department: z.string().min(1, "Department is required").max(100),
  monthly_salary: z.number().nonnegative().optional(),
  expected_start_date: z.string().min(1, "Expected start date is required"),
  status: z
    .enum(["planned", "approved", "hiring", "hired", "cancelled"])
    .default("planned"),
  notes: z.string().max(2000).optional(),
});

export const updateHeadcountSchema = createHeadcountSchema.partial();

// ─── Cap Table ───────────────────────────────────────────

export const createRoundSchema = z.object({
  name: z.string().min(1, "Round name is required").max(200),
  round_date: z.string().min(1, "Round date is required"),
  pre_money_valuation: z.number().nonnegative(),
  amount_raised: z.number().nonnegative(),
  share_price: z.number().positive(),
  shares_issued: z.number().int().positive(),
  investor_names: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const createShareholderSchema = z.object({
  name: z.string().min(1, "Shareholder name is required").max(200),
  type: z.enum(["founder", "investor", "employee", "advisor", "other"]),
  shares: z.number().int().nonnegative(),
  share_class: z.string().max(50).optional().default("common"),
  investment_amount: z.number().nonnegative().optional(),
  vesting_start_date: z.string().optional().nullable(),
  vesting_months: z.number().int().min(0).max(120).optional(),
  cliff_months: z.number().int().min(0).max(48).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

// ─── AI Config ───────────────────────────────────────────

export const updateAiConfigSchema = z.object({
  proactivity_level: z.enum(["low", "medium", "high"]).optional(),
  tone: z.enum(["professional", "casual", "technical"]).optional(),
  insight_focus: z
    .array(z.enum(["finance", "burn_rate", "growth", "team", "product"]))
    .optional(),
});
