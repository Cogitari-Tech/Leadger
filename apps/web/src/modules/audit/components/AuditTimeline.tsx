import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";
import { CheckCircle, ShieldAlert, FileText, Send } from "lucide-react";

interface AuditTimelineProps {
  auditId: string;
}

interface AuditLog {
  id: string;
  action: string;
  metadata_json: Record<string, any>;
  created_at: string;
  performed_by: string;
}

export function AuditTimeline({ auditId }: AuditTimelineProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!auditId) return;
      try {
        const { data, error } = await supabase
          .from("audit_activity_log")
          .select("*")
          .eq("audit_id", auditId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setLogs(data as AuditLog[]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [auditId]);

  if (loading)
    return (
      <div className="text-sm font-medium text-foreground/50 animate-pulse">
        Carregando histórico...
      </div>
    );

  if (logs.length === 0)
    return (
      <div className="text-sm font-medium text-foreground/50 italic glass-card p-6 rounded-2xl text-center border-dashed">
        Sem histórico de revisões ou submissões ainda.
      </div>
    );

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {logs.map((log) => {
        let Icon = FileText;
        let colorClass = "text-muted-foreground bg-background";

        switch (log.action) {
          case "Approved":
            Icon = CheckCircle;
            colorClass =
              "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            break;
          case "Returned with feedback":
            Icon = ShieldAlert;
            colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
            break;
          case "Submitted for review":
          case "Resubmitted":
            Icon = Send;
            colorClass = "text-primary bg-primary/10 border-primary/20";
            break;
        }

        return (
          <div
            key={log.id}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Icon Center */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${colorClass}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Content Box */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-sm shadow-sm hover:border-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-foreground">
                  {log.action === "Approved" && "Auditoria Aprovada"}
                  {log.action === "Returned with feedback" &&
                    "Devolvida com Feedback"}
                  {log.action === "Submitted for review" &&
                    "Enviada para Revisão"}
                  {log.action === "Resubmitted" && "Reenviada para Revisão"}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                  {new Date(log.created_at).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              {log.metadata_json?.feedback && (
                <div className="mt-3 p-4 text-sm bg-amber-500/5 rounded-xl text-amber-500 italic border-l-2 border-amber-500">
                  "{log.metadata_json.feedback}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
