import { useAegis } from "@/store/aegis";
import { Lock } from "lucide-react";
import { useEffect, useRef } from "react";
import { analyzeInvoice } from "@/lib/aegis-engine";

export function PolicyPanel() {
  const { policies, updatePolicy, currentInvoiceId, invoices, setAnalysis, log } = useAegis();
  const inv = invoices.find((i) => i.id === currentInvoiceId);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!inv) return;
    const a = analyzeInvoice(inv, policies);
    setAnalysis(a);
    log({ type: "RISK", actor: "engine", message: `Re-evaluated → ${a.decision} (risk ${a.riskScore})`, meta: { trigger: "policy-change" } });
  }, [policies, inv, setAnalysis, log]);

  return (
    <div className="rounded-xl border border-border bg-card/60 shadow-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-4 w-4 text-primary" />
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Policy Controls</h2>
          <p className="text-xs text-muted-foreground">Adjust live · decision re-evaluates instantly</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="font-medium">Max payment limit</span>
            <span className="font-mono text-primary">${policies.maxPayment.toLocaleString()}</span>
          </div>
          <input
            type="range" min={1000} max={20000} step={500}
            value={policies.maxPayment}
            onChange={(e) => updatePolicy("maxPayment", Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground font-mono mt-0.5">
            <span>$1K</span><span>$20K</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="font-medium">Dual approval threshold</span>
            <span className="font-mono text-primary">${policies.dualApprovalThreshold.toLocaleString()}</span>
          </div>
          <input
            type="range" min={1000} max={15000} step={500}
            value={policies.dualApprovalThreshold}
            onChange={(e) => updatePolicy("dualApprovalThreshold", Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="font-medium">Amount anomaly multiplier</span>
            <span className="font-mono text-primary">{policies.amountAnomalyMultiplier.toFixed(2)}×</span>
          </div>
          <input
            type="range" min={1.05} max={3} step={0.05}
            value={policies.amountAnomalyMultiplier}
            onChange={(e) => updatePolicy("amountAnomalyMultiplier", Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Flag when amount exceeds vendor average × multiplier</p>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/40 px-3 py-2.5 cursor-pointer hover:border-primary/40 transition-colors">
          <div>
            <div className="text-xs font-medium">Block unknown vendors</div>
            <div className="text-[10px] text-muted-foreground">Strict mode: auto-fail if vendor not in trusted DB</div>
          </div>
          <input
            type="checkbox"
            checked={policies.blockUnknownVendors}
            onChange={(e) => updatePolicy("blockUnknownVendors", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
        </label>
      </div>
    </div>
  );
}
