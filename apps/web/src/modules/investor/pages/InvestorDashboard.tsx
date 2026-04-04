import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, RefreshCcw, FileText, CheckCircle2 } from "lucide-react";

export default function InvestorDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports] = useState([
    { id: 1, name: "Q1 2026 Pitch Deck", date: "2026-04-01", status: "ready" },
    {
      id: 2,
      name: "Financial Highlights (Mar)",
      date: "2026-03-31",
      status: "ready",
    },
  ]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate calling the background Inngest job
      const res = await fetch(
        "http://localhost:3000/api/investor/reports/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "monthly" }),
        },
      );
      if (res.ok) {
        console.log("Job despachado!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsGenerating(false), 2000);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Investor Relations
        </h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Generate New Report
          </Button>
        </div>
      </div>
      <Tabs defaultValue="data-room" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data-room">Data Room</TabsTrigger>
          <TabsTrigger value="updates">Recent Updates</TabsTrigger>
        </TabsList>
        <TabsContent value="data-room" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Data Room Health
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
                <p className="text-xs text-muted-foreground">
                  All required docs uploaded
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>
                Generated reports ready for investor distribution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {r.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Generated: {r.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="updates">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Investor Updates</CardTitle>
              <CardDescription>
                Automatic summaries of product metrics and financial health.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                No new updates. Click 'Generate New Report' to process
                background jobs.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
