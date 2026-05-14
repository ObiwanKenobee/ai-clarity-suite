import { Activity, AlertTriangle, ShieldCheck, UserCircle2 } from "lucide-react";
import { useCurrentAnalysis, useCurrentFinalStatus } from "@/store/aegis";

export function TopBar() {
  const analysis = useCurrentAnalysis();
  const finalStatus = useCurrentFinalStatus();

  const score = analysis?.riskScore ?? 0;
  const tier = score >= 70 ? { label: "High", color: "text-critical", bar: "bg-critical", w: "100%" }
    : score >= 30 ? { label: "Medium", color: "text-warning", bar: "bg-warning", w: `${score}%` }
    : { label: "Low", color: "text-safe", bar: "bg-safe", w: `${Math.max(score, 5)}%` };

  const alerts = analysis?.flags.filter((f) => f.severity !== "safe").length ?? 0;

  return (
    <header className="border-b border-border bg-panel/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="absolute -inset-1 rounded-full bg-primary/20 blur-md -z-10" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold tracking-tight text-base">AEGIS<span className="text-primary"> Sentinel</span></span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AI Decision Oversight</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-safe animate-ping opacity-60" />
              <span className="relative rounded-full h-2.5 w-2.5 bg-safe" />
            </span>
            <span className="text-xs text-muted-foreground">Status</span>
            <span className={`text-xs font-semibold ${
              finalStatus === "BLOCKED" ? "text-critical"
              : finalStatus === "APPROVED" ? "text-safe"
              : finalStatus === "UNDER_REVIEW" ? "text-warning"
              : "text-primary"
            }`}>{finalStatus.replace("_", " ")}</span>
          </div>

          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Live Risk</span>
                <span className={`font-semibold ${tier.color}`}>{tier.label} · {score}</span>
              </div>
              <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${tier.bar}`} style={{ width: tier.w }} />
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
            alerts > 0 ? "bg-warning/10 border-warning/30" : "bg-safe/10 border-safe/30"
          }`}>
            <AlertTriangle className={`h-4 w-4 ${alerts > 0 ? "text-warning" : "text-safe"}`} />
            <span className={`text-xs font-medium ${alerts > 0 ? "text-warning" : "text-safe"}`}>{alerts} anomalies</span>
          </div>

          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <UserCircle2 className="h-7 w-7 text-muted-foreground" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium">M. Chen</span>
              <span className="text-[10px] text-muted-foreground">Compliance Officer</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
