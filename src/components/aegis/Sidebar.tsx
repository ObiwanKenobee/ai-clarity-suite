import { useAegis } from "@/store/aegis";
import { FileText, Bot, ScrollText, Upload, Lock } from "lucide-react";

export function Sidebar() {
  const { invoices, currentInvoiceId, selectInvoice, audit, policies } = useAegis();
  const currentInvoice = invoices.find((i) => i.id === currentInvoiceId);

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-panel/40 overflow-y-auto">
      <div className="p-4 space-y-6">
        <Section title="Inputs" icon={Upload}>
          {invoices.map((it) => (
            <button
              key={it.id}
              onClick={() => selectInvoice(it.id)}
              className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-md transition-colors border ${
                it.id === currentInvoiceId
                  ? "bg-primary/10 border-primary/30"
                  : "border-transparent hover:bg-accent/40 hover:border-border"
              }`}
            >
              <span className="text-xs font-medium truncate">{it.fileName}</span>
              <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                ${it.amount.toLocaleString()}
              </span>
            </button>
          ))}
          {invoices.length === 0 && (
            <div className="text-[11px] text-muted-foreground px-3 py-2">No invoices yet — upload one above</div>
          )}
        </Section>

        <Section title="Agents" icon={Bot}>
          <Item label="Invoice Analyzer" meta="v2.4 · running" dot />
          <Item label="Decision Agent" meta="v1.8 · running" dot />
          <Item label="Vendor Verifier" meta="v1.2 · idle" />
        </Section>

        <Section title="Policies" icon={Lock}>
          <Item label={`Max payment $${policies.maxPayment.toLocaleString()}`} meta="Hard limit" />
          <Item label="Unknown vendors" meta={policies.blockUnknownVendors ? "Block" : "Flag"} />
          <Item label={`Dual approval > $${policies.dualApprovalThreshold.toLocaleString()}`} meta="Active" />
        </Section>

        <Section title="Audit Log" icon={ScrollText}>
          {audit.slice(0, 6).map((e) => (
            <div key={e.id} className="px-3 py-1.5 rounded-md hover:bg-accent/30">
              <div className="text-[11px] truncate">{e.message}</div>
              <div className="text-[9px] font-mono text-muted-foreground">
                {new Date(e.ts).toLocaleTimeString("en-GB", { hour12: false })} · {e.type}
              </div>
            </div>
          ))}
        </Section>

        {currentInvoice && (
          <div className="rounded-lg border border-border bg-card/50 p-3 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                Document Preview
              </span>
            </div>
            <div className="aspect-[4/5] rounded bg-background/60 border border-border p-3 text-[8px] font-mono text-muted-foreground space-y-1 overflow-hidden">
              <div className="font-bold text-foreground/80 text-[10px]">INVOICE #{currentInvoice.invoiceNumber}</div>
              <div className="h-px bg-border my-1" />
              <div>From: {currentInvoice.vendor}</div>
              <div>Date: {currentInvoice.date}</div>
              <div className="h-px bg-border my-1" />
              <div className="text-foreground/70 line-clamp-[12] whitespace-pre-wrap break-words">
                {currentInvoice.rawText.slice(0, 400) || "(no extracted text)"}
              </div>
              <div className="h-px bg-border my-1" />
              <div className="text-warning font-bold">TOTAL: ${currentInvoice.amount.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">{title}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Item({ label, meta, dot }: { label: string; meta: string; dot?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-accent/30">
      <div className="flex items-center gap-2 min-w-0">
        {dot && <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse-ring" />}
        <span className="text-xs font-medium truncate">{label}</span>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{meta}</span>
    </div>
  );
}
