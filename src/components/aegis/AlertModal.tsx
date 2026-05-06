import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: "review" | "block" | "approve") => void;
}

export function AlertModal({ open, onClose, onAction }: AlertModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (open) setMounted(true); }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-md rounded-2xl border border-warning/40 bg-card p-6 shadow-2xl transition-all ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{ boxShadow: "0 0 0 1px oklch(0.82 0.17 85 / 0.3), 0 20px 80px -20px oklch(0.82 0.17 85 / 0.4)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-warning font-bold mb-1">Sentinel Alert</div>
            <h3 className="text-lg font-semibold leading-tight">Suspicious Transaction Detected</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Trace 8f3c·a204 · Invoice #2026-0481</p>
          </div>
        </div>

        <div className="rounded-lg bg-background/60 border border-border p-3 mb-4 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Reasons</div>
          <ul className="text-xs space-y-1.5">
            <li className="flex gap-2"><span className="text-critical mt-0.5">●</span> Vendor not recognized in trusted database</li>
            <li className="flex gap-2"><span className="text-warning mt-0.5">●</span> Amount $9,450 unusually high (+35%)</li>
            <li className="flex gap-2"><span className="text-warning mt-0.5">●</span> Vendor name only 80% match to known entity</li>
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAction("review")}
            className="px-3 py-2.5 rounded-md bg-secondary hover:bg-accent text-xs font-semibold transition-colors"
          >
            Review
          </button>
          <button
            onClick={() => onAction("block")}
            className="px-3 py-2.5 rounded-md bg-critical/90 hover:bg-critical text-white text-xs font-semibold transition-colors"
          >
            Block
          </button>
          <button
            onClick={() => onAction("approve")}
            className="px-3 py-2.5 rounded-md border border-border hover:bg-accent text-xs font-semibold transition-colors"
          >
            Approve
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 text-center">
          Action will be logged and attributed to your role.
        </p>
      </div>
    </div>
  );
}
