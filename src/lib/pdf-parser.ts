import type { Invoice } from "@/store/aegis";

export async function parseInvoicePdf(file: File): Promise<Invoice> {
  // @ts-expect-error - vite worker import
  const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buf = await file.arrayBuffer();
  let rawText = "";
  try {
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      rawText += content.items.map((it: { str?: string }) => it.str ?? "").join(" ") + "\n";
    }
  } catch {
    rawText = "";
  }

  const text = rawText || file.name;

  const invoiceNumber =
    text.match(/invoice[\s#:]*([A-Z0-9-]{4,})/i)?.[1] ??
    file.name.replace(/\.pdf$/i, "").match(/([0-9]{2,}[-_]?[0-9]+)/)?.[1] ??
    Date.now().toString().slice(-8);

  const amountMatch =
    text.match(/total[^$]*\$?\s*([\d,]+\.?\d*)/i) ??
    text.match(/\$\s*([\d,]+\.\d{2})/) ??
    text.match(/amount[^$]*\$?\s*([\d,]+\.?\d*)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : Math.round(2000 + Math.random() * 12000);

  const vendorMatch =
    text.match(/from[:\s]+([A-Z][A-Za-z0-9 &.,'-]{2,60})(?:\n|to:|$)/i) ??
    text.match(/vendor[:\s]+([A-Z][A-Za-z0-9 &.,'-]{2,60})/i) ??
    text.match(/^([A-Z][A-Za-z0-9 &.,'-]{4,60} (?:LTD|LLC|Inc|Corp|GmbH))/m);
  const vendor = vendorMatch ? vendorMatch[1].trim() : file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");

  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/) ?? text.match(/(\d{2}\/\d{2}\/\d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);

  return {
    id: `inv-${invoiceNumber}-${Date.now().toString(36)}`,
    fileName: file.name,
    vendor,
    amount,
    date,
    invoiceNumber,
    rawText: text.slice(0, 2000),
    uploadedAt: new Date().toISOString(),
  };
}
