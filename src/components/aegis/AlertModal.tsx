import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAegis, useCurrentAnalysis, useCurrentInvoice } from "@/store/aegis";

export function AlertModal() {
  const { alertOpen, closeAlert, resolveAlert } = useAegis();
  const analysis = useCurrentAnalysis();
  const inv = useCurrentInvoice();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (alertOpen) setMounted(true); else setMounted(false); }, [alertOpen]);

  if (!alertOpen || !analysis) return null;
  const topFlags = analysis.flags.filter((f) => f.severity !== "safe").slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeAlert} />
      <div
        className={`relative w-full max-w-md rounded-2xl border border-warning/40 bg-card p-6 shadow-2xl transition-all ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button onClick={closeAlert} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-warning font-bold mb-1">Sentinel Alert</div>
            <h3 className="text-lg font-semibold leading-tight">
              {analysis.decision === "BLOCKED" ? "Transaction Auto-Blocked" : "Suspicious Transaction Detected"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Trace {analysis.traceId} · Invoice #{inv?.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-background/60 border border-border p-3 mb-4 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Reasons</div>
          <ul className="text-xs space-y-1.5">
            {topFlags.length === 0 && <li className="text-muted-foreground">No active anomalies — safe to approve.</li>}
            {topFlags.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className={f.severity === "critical" ? "text-critical mt-0.5" : "text-warning mt-0.5"}>●</span>
                <span><strong>{f.label}:</strong> {f.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => resolveAlert("review")}
            className="px-3 py-2.5 rounded-md bg-secondary hover:bg-accent text-xs font-semibold transition-colors">
            Review
          </button>
          <button onClick={() => resolveAlert("block")}
            className="px-3 py-2.5 rounded-md bg-critical/90 hover:bg-critical text-white text-xs font-semibold transition-colors">
            Block
          </button>
          <button onClick={() => resolveAlert("approve")}
            className="px-3 py-2.5 rounded-md border border-border hover:bg-accent text-xs font-semibold transition-colors">
            Approve Anyway
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 text-center">
          Action will be logged and attributed to your role.
        </p>
      </div>
    </div>
  );
}
