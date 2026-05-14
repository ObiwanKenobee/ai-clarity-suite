import { CheckCircle2, FileUp, Brain, ShieldAlert, Gavel, X } from "lucide-react";
import { useState } from "react";
import { useCurrentAnalysis, useAegis, type NodeOutput, type TraceItem } from "@/store/aegis";

const iconMap = { upload: FileUp, analyze: Brain, risk: ShieldAlert, decision: Gavel } as const;

const statusStyles: Record<string, string> = {
  done: "border-safe/40 bg-safe/10 text-safe",
  warning: "border-warning/40 bg-warning/10 text-warning",
  critical: "border-critical/40 bg-critical/10 text-critical",
};

// Map nodes → which trace sources they computed
const nodeSignals: Record<NodeOutput["id"], TraceItem["source"][]> = {
  upload: ["format", "duplicate"],
  analyze: ["vendor"],
  risk: ["amount", "vendor"],
  decision: ["policy"],
};

export function DecisionFlow() {
  const analysis = useCurrentAnalysis();
  const policies = useAegis((s) => s.policies);
  const [activeId, setActiveId] = useState<NodeOutput["id"] | null>(null);

  if (!analysis) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-xs text-muted-foreground">
        Decision pipeline idle — upload an invoice to begin
      </div>
    );
  }

  const active = activeId ? analysis.nodes.find((n) => n.id === activeId) ?? null : null;

  return (
    <>
      <div className="rounded-xl border border-border bg-card/60 shadow-panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Decision Flow</h2>
              <p className="text-xs text-muted-foreground">Real-time agent pipeline · Trace {analysis.traceId}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
              LIVE · click any node to inspect
            </div>
          </div>

          <div className="flex items-stretch gap-2">
            {analysis.nodes.map((n, i) => {
              const Icon = iconMap[n.id];
              return (
                <div key={n.id} className="flex items-stretch flex-1">
                  <button
                    onClick={() => setActiveId(n.id)}
                    className={`flex-1 text-left rounded-lg border p-3 transition-all ${
                      activeId === n.id
                        ? "border-primary/60 bg-primary/10 shadow-glow"
                        : "border-border bg-background/40 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-7 w-7 rounded-md flex items-center justify-center border ${statusStyles[n.status]}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <CheckCircle2 className={`h-3.5 w-3.5 ${
                        n.status === "done" ? "text-safe" : n.status === "critical" ? "text-critical" : "text-warning"
                      }`} />
                    </div>
                    <div className="text-xs font-semibold leading-tight">{n.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-1">{n.time}</div>
                    <div className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{n.detail}</div>
                  </button>
                  {i < analysis.nodes.length - 1 && (
                    <svg className="w-6 h-auto self-center" viewBox="0 0 24 8" fill="none">
                      <line x1="0" y1="4" x2="24" y2="4" stroke="currentColor" className="text-primary/60 animate-flow" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide-in drawer */}
      {active && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setActiveId(null)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[480px] border-l border-border bg-card shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">Agent Output · {active.id}</div>
                  <h3 className="text-base font-semibold">{active.label}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{active.time} · trace {analysis.traceId}</p>
                </div>
                <button onClick={() => setActiveId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Section label="Inputs / Evidence">
                <div className="space-y-1">
                  {active.evidence.map((e) => (
                    <div key={e.key} className="flex justify-between text-[11px] gap-3 border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">{e.key}</span>
                      <span className="font-mono text-right">{e.value}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section label="Computed Signals">
                <div className="space-y-1.5">
                  {analysis.trace
                    .filter((t) => nodeSignals[active.id].includes(t.source))
                    .map((t, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] rounded border border-border/50 bg-background/40 px-2 py-1.5">
                        <span className={`mt-0.5 ${
                          t.kind === "ok" ? "text-safe" : t.kind === "warn" ? "text-warning" : "text-critical"
                        }`}>●</span>
                        <span className="flex-1">{t.text}</span>
                        <span className="font-mono text-muted-foreground">w {t.weight.toFixed(2)}</span>
                      </div>
                    ))}
                  {analysis.trace.filter((t) => nodeSignals[active.id].includes(t.source)).length === 0 && (
                    <p className="text-[11px] text-muted-foreground">No computed signals at this step.</p>
                  )}
                </div>
              </Section>

              {active.policyChecks && (
                <Section label="Policy Checks">
                  <div className="space-y-1.5">
                    {active.policyChecks.map((p) => (
                      <div key={p.name} className={`text-[11px] rounded px-2 py-1.5 border ${
                        p.passed ? "border-safe/30 bg-safe/5" : "border-critical/30 bg-critical/5"
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{p.name}</span>
                          <span className={p.passed ? "text-safe" : "text-critical"}>{p.passed ? "PASS" : "FAIL"}</span>
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-0.5">{p.detail}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Section label="Active Policy Snapshot">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <Snap k="Max payment" v={`$${policies.maxPayment.toLocaleString()}`} />
                  <Snap k="Dual approval >" v={`$${policies.dualApprovalThreshold.toLocaleString()}`} />
                  <Snap k="Anomaly mult." v={`${policies.amountAnomalyMultiplier.toFixed(2)}×`} />
                  <Snap k="Block unknown" v={policies.blockUnknownVendors ? "ON" : "OFF"} />
                </div>
              </Section>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{label}</div>
      {children}
    </div>
  );
}

function Snap({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded border border-border/50 bg-background/40 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="font-mono text-foreground">{v}</div>
    </div>
  );
}
