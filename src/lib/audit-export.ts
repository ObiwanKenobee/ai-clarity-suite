import jsPDF from "jspdf";
import type { AuditEntry, Analysis, Invoice, Policies } from "@/store/aegis";

interface ExportData {
  invoice: Invoice | null;
  analysis: Analysis | null;
  policies: Policies;
  audit: AuditEntry[];
  finalStatus: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJson(data: ExportData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, `aegis-audit-${Date.now()}.json`);
}

export function exportCsv(data: ExportData) {
  const rows: string[] = [["Timestamp", "Type", "Actor", "Message", "Meta"].join(",")];
  for (const e of [...data.audit].reverse()) {
    rows.push(
      [e.ts, e.type, e.actor, JSON.stringify(e.message), JSON.stringify(e.meta ?? {})]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    );
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  downloadBlob(blob, `aegis-audit-${Date.now()}.csv`);
}

export function exportPdf(data: ExportData) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  let y = margin;
  const lh = 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("AEGIS Sentinel — Audit Trail", margin, y);
  y += lh + 4;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Exported: ${new Date().toISOString()}`, margin, y);
  y += lh * 2;

  if (data.invoice) {
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", margin, y); y += lh;
    doc.setFont("helvetica", "normal");
    [
      `File: ${data.invoice.fileName}`,
      `Number: ${data.invoice.invoiceNumber}`,
      `Vendor: ${data.invoice.vendor}`,
      `Amount: $${data.invoice.amount.toLocaleString()}`,
      `Final status: ${data.finalStatus}`,
    ].forEach((l) => { doc.text(l, margin, y); y += lh; });
    y += lh;
  }

  if (data.analysis) {
    doc.setFont("helvetica", "bold");
    doc.text(`Analysis (Trace ${data.analysis.traceId})`, margin, y); y += lh;
    doc.setFont("helvetica", "normal");
    doc.text(`Decision: ${data.analysis.decision} · Risk ${data.analysis.riskScore}/100`, margin, y); y += lh;
    doc.text(`Policies: ${data.analysis.policyCompliancePassed}/${data.analysis.policyComplianceTotal} passed`, margin, y);
    y += lh * 2;

    doc.setFont("helvetica", "bold"); doc.text("Reasoning trace:", margin, y); y += lh;
    doc.setFont("helvetica", "normal");
    data.analysis.trace.forEach((t, i) => {
      const line = `${i + 1}. [${t.kind.toUpperCase()}] ${t.text} (w=${t.weight.toFixed(2)})`;
      const split = doc.splitTextToSize(line, 520);
      if (y > 750) { doc.addPage(); y = margin; }
      doc.text(split, margin, y); y += lh * split.length;
    });
    y += lh;
  }

  doc.setFont("helvetica", "bold"); doc.text("Active policies:", margin, y); y += lh;
  doc.setFont("helvetica", "normal");
  Object.entries(data.policies).filter(([k]) => !["knownVendors", "vendorAverages"].includes(k))
    .forEach(([k, v]) => { doc.text(`${k}: ${String(v)}`, margin, y); y += lh; });
  y += lh;

  if (y > 720) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "bold"); doc.text("Audit log:", margin, y); y += lh;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  [...data.audit].reverse().forEach((e) => {
    const line = `${e.ts} · ${e.type} · ${e.actor} · ${e.message}`;
    const split = doc.splitTextToSize(line, 520);
    if (y > 760) { doc.addPage(); y = margin; }
    doc.text(split, margin, y); y += 11 * split.length;
  });

  doc.save(`aegis-audit-${Date.now()}.pdf`);
}
