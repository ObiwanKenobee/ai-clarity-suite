import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/aegis/TopBar";
import { Sidebar } from "@/components/aegis/Sidebar";
import { DecisionFlow } from "@/components/aegis/DecisionFlow";
import { RiskCard } from "@/components/aegis/RiskCard";
import { ExplanationPanel } from "@/components/aegis/ExplanationPanel";
import { AlertModal } from "@/components/aegis/AlertModal";
import { PolicyPanel } from "@/components/aegis/PolicyPanel";
import {
  useAegis, useCurrentInvoice, useCurrentAnalysis,
  useCurrentFinalStatus, useCurrentUserAction, useCurrentAudit,
} from "@/store/aegis";
import { analyzeInvoice } from "@/lib/aegis-engine";
import { parseInvoicePdf } from "@/lib/pdf-parser";
import { exportJson, exportCsv, exportPdf } from "@/lib/audit-export";
import { Upload, Download, Loader2, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AEGIS Sentinel — AI Decision Oversight" },
      { name: "description", content: "Make invisible AI decisions visible, understandable, and controllable in seconds. Real-time agent monitoring with explainable risk analysis." },
      { property: "og:title", content: "AEGIS Sentinel — AI Decision Oversight" },
      { property: "og:description", content: "Real-time agent monitoring with explainable risk analysis." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { addInvoice, setAnalysis, policies, log, openAlert, currentInvoiceId } = useAegis();
  const inv = useCurrentInvoice();
  const analysis = useCurrentAnalysis();
  const finalStatus = useCurrentFinalStatus();
  const lastUserAction = useCurrentUserAction();
  const audit = useCurrentAudit();
  const [busy, setBusy] = useState(false);
  const [exportMenu, setExportMenu] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const seededOnce = useRef(false);

  // auto-analyze whenever the selected invoice has no analysis yet
  useEffect(() => {
    if (!inv || analysis) return;
    const a = analyzeInvoice(inv, policies);
    setAnalysis(a);
    log({ type: "ANALYSIS", actor: "engine", message: `Analyzed ${inv.fileName} → ${a.decision}`, meta: { riskScore: a.riskScore } });
    if (a.decision !== "APPROVED" && !seededOnce.current) {
      seededOnce.current = true;
      const t = setTimeout(() => openAlert(), 1200);
      return () => clearTimeout(t);
    }
  }, [inv, analysis, policies, setAnalysis, log, openAlert]);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      log({ type: "UPLOAD", actor: "M. Chen", message: `Uploading ${file.name}` });
      const parsed = await parseInvoicePdf(file);
      addInvoice(parsed);
      log({ type: "ANALYSIS", actor: "engine", message: `Parsed ${parsed.fileName} · vendor "${parsed.vendor}" · $${parsed.amount.toLocaleString()}`, invoiceId: parsed.id });
      const a = analyzeInvoice(parsed, policies);
      // setAnalysis writes to the just-selected invoice (addInvoice set it as current)
      setAnalysis(a);
      log({ type: "DECISION", actor: "engine", message: `Decision: ${a.decision} (risk ${a.riskScore})`, meta: { traceId: a.traceId }, invoiceId: parsed.id });
      if (a.decision !== "APPROVED") {
        log({ type: "ALERT", actor: "engine", message: `Alert raised for ${parsed.fileName}`, invoiceId: parsed.id });
        setTimeout(() => openAlert(), 400);
      }
    } catch (err) {
      log({ type: "ANALYSIS", actor: "engine", message: `Parse failed: ${(err as Error).message}` });
    } finally {
      setBusy(false);
    }
  }

  function doExport(kind: "json" | "csv" | "pdf") {
    const data = { invoice: inv ?? null, analysis, policies, audit, finalStatus };
    if (kind === "json") exportJson(data);
    if (kind === "csv") exportCsv(data);
    if (kind === "pdf") exportPdf(data);
    log({ type: "USER_ACTION", actor: "M. Chen", message: `Audit trail exported as ${kind.toUpperCase()} (invoice ${inv?.invoiceNumber ?? "—"})` });
    setExportMenu(false);
  }

  const decisionLabel = analysis
    ? analysis.decision.replace(/_/g, " ")
    : "Awaiting input";
  const decisionClass = !analysis ? "text-muted-foreground"
    : analysis.decision === "BLOCKED" ? "text-critical"
    : analysis.decision === "APPROVED_WITH_WARNING" ? "text-warning"
    : "text-safe";

  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="relative">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
            <div className="relative p-6 space-y-5 max-w-[1400px]">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Decision Oversight</h1>
                  <p className="text-sm text-muted-foreground">
                    {inv ? <>Invoice <span className="font-mono text-foreground">#{inv.invoiceNumber}</span> · {inv.vendor} · </> : "No invoice selected · "}
                    <span className={decisionClass}>{decisionLabel}</span>
                    {lastUserAction && <span className="ml-2 text-[11px] uppercase tracking-wider text-primary">→ {finalStatus.replace("_", " ")}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={fileInput} type="file" accept="application/pdf" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                  />
                  <button
                    onClick={() => fileInput.current?.click()}
                    disabled={busy}
                    className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {busy ? "Parsing…" : "Upload Invoice PDF"}
                  </button>
                  {analysis && (
                    <button onClick={openAlert}
                      className="px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium hover:bg-accent transition-colors flex items-center gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5" /> Replay Alert
                    </button>
                  )}
                  <div className="relative">
                    <button onClick={() => setExportMenu((v) => !v)}
                      className="px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Export Audit
                    </button>
                    {exportMenu && (
                      <div className="absolute right-0 mt-1 w-40 rounded-md border border-border bg-popover shadow-lg z-10 py-1">
                        {(["json", "csv", "pdf"] as const).map((k) => (
                          <button key={k} onClick={() => doExport(k)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent uppercase font-mono tracking-wider">
                            {k}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DecisionFlow />

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  <RiskCard />
                  <PolicyPanel />
                </div>
                <div className="lg:col-span-3">
                  <ExplanationPanel />
                </div>
              </div>

              {lastUserAction && (
                <div className={`rounded-md border px-4 py-2.5 text-xs flex items-center justify-between ${
                  finalStatus === "BLOCKED" ? "border-critical/40 bg-critical/10"
                  : finalStatus === "APPROVED" ? "border-safe/40 bg-safe/10"
                  : "border-warning/40 bg-warning/10"
                }`}>
                  <span>
                    Action <span className="font-semibold uppercase">{lastUserAction}</span> recorded · status now{" "}
                    <span className="font-semibold">{finalStatus.replace("_", " ")}</span> · attributed to M. Chen ·{" "}
                    {new Date().toLocaleTimeString("en-GB", { hour12: false })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AlertModal />
    </div>
  );
}
