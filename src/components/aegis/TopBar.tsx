import { Activity, AlertTriangle, ShieldCheck, UserCircle2 } from "lucide-react";

interface TopBarProps {
  riskLevel: "low" | "medium" | "high";
  alerts: number;
}

const riskMap = {
  low: { label: "Low", color: "text-safe", bar: "w-1/4 bg-safe" },
  medium: { label: "Medium", color: "text-warning", bar: "w-2/3 bg-warning" },
  high: { label: "High", color: "text-critical", bar: "w-full bg-critical" },
};

export function TopBar({ riskLevel, alerts }: TopBarProps) {
  const r = riskMap[riskLevel];
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
            <span className="text-xs text-muted-foreground">Agent</span>
            <span className="text-xs font-medium text-safe">ACTIVE</span>
          </div>

          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Live Risk</span>
                <span className={`font-semibold ${r.color}`}>{r.label}</span>
              </div>
              <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all ${r.bar}`} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-warning/10 border border-warning/30">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-medium text-warning">{alerts} anomalies</span>
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
