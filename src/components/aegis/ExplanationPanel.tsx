import { Check, X, AlertCircle, Sparkles } from "lucide-react";

const trace = [
  { kind: "ok", text: "Vendor name matches 80% similarity to 'NorthStar Logistics Inc'", weight: 0.18 },
  { kind: "warn", text: "Amount $9,450 exceeds 90-day vendor average by 35%", weight: 0.31 },
  { kind: "ok", text: "Invoice schema valid · all required fields present", weight: 0.05 },
  { kind: "fail", text: "Vendor not found in trusted vendor database", weight: 0.42 },
  { kind: "ok", text: "No duplicate invoice IDs found in last 180 days", weight: 0.04 },
];

const iconMap = {
  ok: { Icon: Check, cls: "text-safe bg-safe/10 border-safe/30" },
  warn: { Icon: AlertCircle, cls: "text-warning bg-warning/10 border-warning/30" },
  fail: { Icon: X, cls: "text-critical bg-critical/10 border-critical/30" },
} as const;

export function ExplanationPanel() {
  return (
    <div className="rounded-xl border border-border bg-card/60 shadow-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Explanation Trace</h2>
            <p className="text-xs text-muted-foreground">Why the agent reached this decision</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-safe" /> Pass</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> Warn</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-critical" /> Fail</span>
        </div>
      </div>

      <div className="space-y-2">
        {trace.map((t, i) => {
          const { Icon, cls } = iconMap[t.kind as keyof typeof iconMap];
          return (
            <div key={i} className="flex items-center gap-3 group">
              <div className="text-[10px] font-mono text-muted-foreground w-5">{String(i + 1).padStart(2, "0")}</div>
              <div className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 ${cls}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0 text-xs">{t.text}</div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-1 w-20 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      t.kind === "ok" ? "bg-safe" : t.kind === "warn" ? "bg-warning" : "bg-critical"
                    }`}
                    style={{ width: `${t.weight * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">
                  {(t.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <div className="text-[10px] font-mono text-muted-foreground">
          Model: aegis-reasoner-v2.4 · 142ms · 5 signals
        </div>
        <button className="text-[11px] text-primary hover:underline font-medium">
          View full reasoning chain →
        </button>
      </div>
    </div>
  );
}
