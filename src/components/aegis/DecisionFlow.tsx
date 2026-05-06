import { CheckCircle2, FileUp, Brain, ShieldAlert, Gavel } from "lucide-react";
import { useState } from "react";

const nodes = [
  { id: "upload", label: "Invoice Upload", icon: FileUp, status: "done", time: "14:32:05", detail: "INV-2026-0481.pdf · 248 KB" },
  { id: "analyze", label: "AI Analysis", icon: Brain, status: "done", time: "14:32:06", detail: "Extracted 14 fields · 98% confidence" },
  { id: "risk", label: "Risk Check", icon: ShieldAlert, status: "warning", time: "14:32:07", detail: "2 anomalies · score 0.72" },
  { id: "decision", label: "Approved w/ Warning", icon: Gavel, status: "warning", time: "14:32:08", detail: "Awaiting human review" },
];

const statusStyles: Record<string, string> = {
  done: "border-safe/40 bg-safe/10 text-safe",
  warning: "border-warning/40 bg-warning/10 text-warning",
  critical: "border-critical/40 bg-critical/10 text-critical",
};

export function DecisionFlow() {
  const [active, setActive] = useState("risk");
  return (
    <div className="rounded-xl border border-border bg-card/60 shadow-panel p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Decision Flow</h2>
            <p className="text-xs text-muted-foreground">Real-time agent pipeline · Trace ID 8f3c·a204</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
            LIVE
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          {nodes.map((n, i) => (
            <div key={n.id} className="flex items-stretch flex-1">
              <button
                onClick={() => setActive(n.id)}
                className={`flex-1 text-left rounded-lg border p-3 transition-all ${
                  active === n.id
                    ? "border-primary/50 bg-primary/5 shadow-glow"
                    : "border-border bg-background/40 hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-7 w-7 rounded-md flex items-center justify-center border ${statusStyles[n.status]}`}>
                    <n.icon className="h-3.5 w-3.5" />
                  </div>
                  <CheckCircle2 className={`h-3.5 w-3.5 ${n.status === "done" ? "text-safe" : "text-warning"}`} />
                </div>
                <div className="text-xs font-semibold leading-tight">{n.label}</div>
                <div className="text-[10px] text-muted-foreground font-mono mt-1">{n.time}</div>
                <div className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{n.detail}</div>
              </button>
              {i < nodes.length - 1 && (
                <svg className="w-6 h-auto self-center" viewBox="0 0 24 8" fill="none">
                  <line x1="0" y1="4" x2="24" y2="4" stroke="currentColor" className="text-primary/60 animate-flow" strokeWidth="1.5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
