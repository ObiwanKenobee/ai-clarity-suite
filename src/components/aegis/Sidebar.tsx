import { FileText, Bot, Lock, ScrollText, Upload, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "Inputs",
    icon: Upload,
    items: [
      { name: "INV-2026-0481.pdf", meta: "Just now", active: true },
      { name: "INV-2026-0480.pdf", meta: "12 min ago" },
      { name: "INV-2026-0479.pdf", meta: "1 hr ago" },
    ],
  },
  {
    title: "Agents",
    icon: Bot,
    items: [
      { name: "Invoice Analyzer", meta: "v2.4 · running", dot: "safe" as const },
      { name: "Decision Agent", meta: "v1.8 · running", dot: "safe" as const },
      { name: "Vendor Verifier", meta: "v1.2 · idle", dot: "muted" as const },
    ],
  },
  {
    title: "Policies",
    icon: Lock,
    items: [
      { name: "Max payment $10,000", meta: "Hard limit" },
      { name: "Unknown vendors → flag", meta: "Active" },
      { name: "Dual approval > $5k", meta: "Active" },
    ],
  },
  {
    title: "Audit Logs",
    icon: ScrollText,
    items: [
      { name: "Decision logged", meta: "14:32:08" },
      { name: "Policy evaluated", meta: "14:32:07" },
      { name: "Agent invoked", meta: "14:32:05" },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-72 shrink-0 border-r border-border bg-panel/40 overflow-y-auto">
      <div className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <section.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  {section.title}
                </span>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.name}
                  className={`w-full text-left group flex items-center justify-between gap-2 px-3 py-2 rounded-md transition-colors border ${
                    "active" in item && item.active
                      ? "bg-primary/10 border-primary/30"
                      : "border-transparent hover:bg-accent/40 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {"dot" in item && item.dot && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.dot === "safe" ? "bg-safe animate-pulse-ring" : "bg-muted-foreground"
                        }`}
                      />
                    )}
                    <span className="text-xs font-medium truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{item.meta}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-border bg-card/50 p-3 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Document Preview
            </span>
          </div>
          <div className="aspect-[4/5] rounded bg-background/60 border border-border p-3 text-[8px] font-mono text-muted-foreground space-y-1 overflow-hidden">
            <div className="font-bold text-foreground/80 text-[10px]">INVOICE #2026-0481</div>
            <div className="h-px bg-border my-1" />
            <div>From: NorthStar Logistics LTD</div>
            <div>To: Acme Industries</div>
            <div>Date: 2026-05-06</div>
            <div className="h-px bg-border my-1" />
            <div>Consulting svc... $4,200</div>
            <div>Express freight... $3,800</div>
            <div>Handling fee...... $1,450</div>
            <div className="h-px bg-border my-1" />
            <div className="text-warning font-bold">TOTAL: $9,450.00</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
