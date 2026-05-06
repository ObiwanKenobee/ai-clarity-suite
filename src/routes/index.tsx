import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/aegis/TopBar";
import { Sidebar } from "@/components/aegis/Sidebar";
import { DecisionFlow } from "@/components/aegis/DecisionFlow";
import { RiskCard } from "@/components/aegis/RiskCard";
import { ExplanationPanel } from "@/components/aegis/ExplanationPanel";
import { AlertModal } from "@/components/aegis/AlertModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AEGIS Sentinel — AI Decision Oversight" },
      {
        name: "description",
        content:
          "Make invisible AI decisions visible, understandable, and controllable in seconds. Real-time agent monitoring with explainable risk analysis.",
      },
      { property: "og:title", content: "AEGIS Sentinel — AI Decision Oversight" },
      { property: "og:description", content: "Real-time agent monitoring with explainable risk analysis." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAlertOpen(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <TopBar riskLevel="medium" alerts={2} />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="relative">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
            <div className="relative p-6 space-y-5 max-w-[1400px]">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Decision Oversight</h1>
                  <p className="text-sm text-muted-foreground">
                    Invoice <span className="font-mono text-foreground">#2026-0481</span> · NorthStar Logistics LTD ·{" "}
                    <span className="text-warning">Approved with Warning</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAlertOpen(true)}
                    className="px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium hover:bg-accent transition-colors"
                  >
                    Replay Alert
                  </button>
                  <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                    Export Audit Trail
                  </button>
                </div>
              </div>

              <DecisionFlow />

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-2">
                  <RiskCard />
                </div>
                <div className="lg:col-span-3">
                  <ExplanationPanel />
                </div>
              </div>

              {actionTaken && (
                <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-foreground flex items-center justify-between">
                  <span>
                    Action <span className="font-semibold uppercase">{actionTaken}</span> recorded · attributed to M.
                    Chen · 14:32:31 UTC
                  </span>
                  <button onClick={() => setActionTaken(null)} className="text-muted-foreground hover:text-foreground">
                    dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        onAction={(a) => {
          setActionTaken(a);
          setAlertOpen(false);
        }}
      />
    </div>
  );
}
