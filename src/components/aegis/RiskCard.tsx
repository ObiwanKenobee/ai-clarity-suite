import { AlertTriangle, TrendingUp, ShieldAlert } from "lucide-react";

const flags = [
  { label: "Vendor mismatch", severity: "warning", detail: "80% similarity to known vendor 'NorthStar Logistics Inc'" },
  { label: "Amount anomaly", severity: "warning", detail: "35% above 90-day vendor average ($6,990)" },
  { label: "Format valid", severity: "safe", detail: "Schema and required fields verified" },
  { label: "Vendor not in trusted DB", severity: "critical", detail: "No prior approved transactions" },
];

const sevColor: Record<string, string> = {
  safe: "text-safe border-safe/30 bg-safe/5",
  warning: "text-warning border-warning/30 bg-warning/5",
  critical: "text-critical border-critical/30 bg-critical/5",
};

export function RiskCard() {
  const score = 72;
  return (
    <div className="rounded-xl border border-border bg-card/60 shadow-panel p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Risk Analysis</h2>
          <p className="text-xs text-muted-foreground">Multi-signal aggregate scoring</p>
        </div>
        <div className="px-2 py-1 rounded-md border border-warning/30 bg-warning/10 text-warning text-[10px] font-bold tracking-wider">
          MEDIUM
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-secondary" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="currentColor"
              className="text-warning"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono">{score}<span className="text-sm text-muted-foreground">%</span></span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Risk</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-muted-foreground uppercase tracking-wider">Confidence</span>
              <span className="font-mono">94%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "94%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-muted-foreground uppercase tracking-wider">Anomaly Index</span>
              <span className="font-mono text-warning">0.41</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: "41%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-muted-foreground uppercase tracking-wider">Policy Compliance</span>
              <span className="font-mono text-safe">3 / 4</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-safe rounded-full" style={{ width: "75%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Active Flags</span>
        </div>
        {flags.map((f) => (
          <div key={f.label} className={`rounded-md border px-3 py-2 flex items-start gap-2 ${sevColor[f.severity]}`}>
            {f.severity === "safe" ? (
              <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            ) : f.severity === "critical" ? (
              <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold">{f.label}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{f.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
