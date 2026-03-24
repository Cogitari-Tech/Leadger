import { inngest } from "./queue";
import { PrismaClient } from "@prisma/client";

export const generateWeeklyDigestJob = inngest.createFunction(
  { id: "generate-weekly-digest" },
  { cron: "TZ=America/Sao_Paulo 0 8 * * 1" }, // Every Monday at 08:00 AM BRT
  async ({ step }) => {
    const prisma = new PrismaClient();

    await step.run("fetch-tenants", async () => {
      console.log("Buscando workspaces...");
      return ["tenant-1234"];
    });

    await step.run("generate-summaries", async () => {
      console.log("Chamando AnthropicAdapter para cada workspace...");
      // O job faria um POST internamente via serviço ou traria os adapters direto
      return { sent: 1 };
    });

    await prisma.$disconnect();
    return { status: "weekly digests dispatched" };
  },
);
