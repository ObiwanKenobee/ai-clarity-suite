import jsPDF from "jspdf";
import type { AuditEntry, Analysis, Invoice, Policies, PolicySnapshot } from "@/store/aegis";

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
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function policyDelta(snap: PolicySnapshot | undefined, base: Policies): string {
  if (!snap) return "";
  const diffs: string[] = [];
  if (snap.maxPayment !== base.maxPayment) diffs.push(`maxPayment=${snap.maxPayment}`);
  if (snap.dualApprovalThreshold !== base.dualApprovalThreshold) diffs.push(`dualApproval=${snap.dualApprovalThreshold}`);
  if (snap.amountAnomalyMultiplier !== base.amountAnomalyMultiplier) diffs.push(`anomalyMult=${snap.amountAnomalyMultiplier}`);
  if (snap.blockUnknownVendors !== base.blockUnknownVendors) diffs.push(`blockUnknown=${snap.blockUnknownVendors}`);
  return diffs.length ? ` [Δ ${diffs.join(", ")}]` : " [policies=current]";
}

export function exportJson(data: ExportData) {
  const enriched = {
    ...data,
    exportedAt: new Date().toISOString(),
    audit: data.audit.map((e) => ({
      ...e,
      effectivePolicies: e.policiesSnapshot ?? null,
      effectivePolicyChecks: e.policyChecksSnapshot ?? null,
    })),
  };
  const blob = new Blob([JSON.stringify(enriched, null, 2)], { type: "application/json" });
  downloadBlob(blob, `aegis-audit-${Date.now()}.json`);
}

export function exportCsv(data: ExportData) {
  const header = [
    "Timestamp", "Type", "Actor", "InvoiceId", "Message",
    "MaxPayment", "DualApproval", "AnomalyMult", "BlockUnknown",
    "PolicyChecks", "Meta",
  ];
  const rows: string[] = [header.join(",")];
  for (const e of [...data.audit].reverse()) {
    const p = e.policiesSnapshot;
    const checks = (e.policyChecksSnapshot ?? []).map((c) => `${c.name}:${c.passed ? "PASS" : "FAIL"}`).join(" | ");
    rows.push(
      [
        e.ts, e.type, e.actor, e.invoiceId ?? "", e.message,
        p?.maxPayment ?? "", p?.dualApprovalThreshold ?? "",
        p?.amountAnomalyMultiplier ?? "", p?.blockUnknownVendors ?? "",
        checks, JSON.stringify(e.meta ?? {}),
      ].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
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

  doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text("AEGIS Sentinel — Audit Trail", margin, y);
  y += lh + 4;
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text(`Exported: ${new Date().toISOString()}`, margin, y);
  y += lh * 2;

  if (data.invoice) {
    doc.setFont("helvetica", "bold"); doc.text("Invoice", margin, y); y += lh;
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

  doc.setFont("helvetica", "bold"); doc.text("Current policy configuration:", margin, y); y += lh;
  doc.setFont("helvetica", "normal");
  Object.entries(data.policies).filter(([k]) => !["knownVendors", "vendorAverages"].includes(k))
    .forEach(([k, v]) => { doc.text(`${k}: ${String(v)}`, margin, y); y += lh; });
  y += lh;

  if (y > 700) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "bold"); doc.text("Audit log (with effective policy at each action):", margin, y); y += lh;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  [...data.audit].reverse().forEach((e) => {
    const delta = policyDelta(e.policiesSnapshot, data.policies);
    const line = `${e.ts} · ${e.type} · ${e.actor} · ${e.message}${delta}`;
    const split = doc.splitTextToSize(line, 520);
    if (y > 760) { doc.addPage(); y = margin; }
    doc.text(split, margin, y); y += 11 * split.length;
    if (e.policyChecksSnapshot && e.policyChecksSnapshot.length) {
      const checks = "    ↳ checks: " + e.policyChecksSnapshot.map((c) => `${c.name}=${c.passed ? "PASS" : "FAIL"}`).join("; ");
      const cs = doc.splitTextToSize(checks, 510);
      if (y > 760) { doc.addPage(); y = margin; }
      doc.text(cs, margin, y); y += 10 * cs.length;
    }
  });

  doc.save(`aegis-audit-${Date.now()}.pdf`);
}
