import { useAegis } from "@/store/aegis";
import { AlertTriangle, TrendingUp, ShieldAlert, ShieldCheck } from "lucide-react";

const sevColor: Record<string, string> = {
  safe: "text-safe border-safe/30 bg-safe/5",
  warning: "text-warning border-warning/30 bg-warning/5",
  critical: "text-critical border-critical/30 bg-critical/5",
};

export function RiskCard() {
  const analysis = useAegis((s) => s.analysis);
  if (!analysis) return <Empty />;

  const score = analysis.riskScore;
  const tier = score >= 70 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";
  const tierClass = score >= 70 ? "border-critical/30 bg-critical/10 text-critical"
    : score >= 30 ? "border-warning/30 bg-warning/10 text-warning"
    : "border-safe/30 bg-safe/10 text-safe";
  const ring = score >= 70 ? "text-critical" : score >= 30 ? "text-warning" : "text-safe";

  return (
    <div className="rounded-xl border border-border bg-card/60 shadow-panel p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Risk Analysis</h2>
          <p className="text-xs text-muted-foreground">Multi-signal aggregate scoring</p>
        </div>
        <div className={`px-2 py-1 rounded-md border text-[10px] font-bold tracking-wider ${tierClass}`}>
          {tier}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-secondary" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className={ring} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`} style={{ transition: "stroke-dasharray 0.6s" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono">{score}<span className="text-sm text-muted-foreground">%</span></span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Risk</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <Bar label="Confidence" value={analysis.confidence} color="primary" />
          <Bar label="Anomaly Index" value={Math.round(analysis.anomalyIndex * 100)} color="warning" mono={analysis.anomalyIndex.toFixed(2)} />
          <Bar label="Policy Compliance" value={(analysis.policyCompliancePassed / analysis.policyComplianceTotal) * 100} color="safe"
            mono={`${analysis.policyCompliancePassed} / ${analysis.policyComplianceTotal}`} />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Active Flags</span>
        </div>
        {analysis.flags.map((f, i) => (
          <div key={i} className={`rounded-md border px-3 py-2 flex items-start gap-2 ${sevColor[f.severity]}`}>
            {f.severity === "safe" ? <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              : f.severity === "critical" ? <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              : <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
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

function Bar({ label, value, color, mono }: { label: string; value: number; color: "primary" | "warning" | "safe"; mono?: string }) {
  const bg = color === "warning" ? "bg-warning" : color === "safe" ? "bg-safe" : "bg-primary";
  const text = color === "warning" ? "text-warning" : color === "safe" ? "text-safe" : "";
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`font-mono ${text}`}>{mono ?? `${Math.round(value)}%`}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${bg}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-xs text-muted-foreground">
      Upload an invoice to run risk analysis
    </div>
  );
}
