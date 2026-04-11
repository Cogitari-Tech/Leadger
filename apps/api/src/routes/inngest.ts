import { serve } from "inngest/hono";
import { inngest } from "../jobs/queue";
import { calculateHealthScoreJob } from "../jobs/health-score";
import { generateWeeklyDigestJob } from "../jobs/weekly-digest";
import { generateDataRoomReportJob } from "../jobs/investor/reports";

export const inngestRoutes = serve({
  client: inngest,
  functions: [
    calculateHealthScoreJob,
    generateWeeklyDigestJob,
    generateDataRoomReportJob,
  ],
});
