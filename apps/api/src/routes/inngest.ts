import { serve } from "inngest/hono";
import { inngest } from "../jobs/queue";
import { calculateHealthScoreJob } from "../jobs/health-score";
import { generateWeeklyDigestJob } from "../jobs/weekly-digest";

export const inngestRoutes = serve({
  client: inngest,
  functions: [calculateHealthScoreJob, generateWeeklyDigestJob],
});
