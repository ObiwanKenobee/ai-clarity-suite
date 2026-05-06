import { create } from "zustand";

export type Decision = "APPROVED" | "APPROVED_WITH_WARNING" | "BLOCKED" | "PENDING";
export type Severity = "safe" | "warning" | "critical";

export interface Invoice {
  id: string;
  fileName: string;
  vendor: string;
  amount: number;
  date: string;
  invoiceNumber: string;
  rawText: string;
  uploadedAt: string;
}

export interface Flag {
  label: string;
  severity: Severity;
  detail: string;
}

export interface TraceItem {
  kind: "ok" | "warn" | "fail";
  text: string;
  weight: number;
  source: "vendor" | "amount" | "format" | "policy" | "duplicate";
}

export interface NodeOutput {
  id: "upload" | "analyze" | "risk" | "decision";
  label: string;
  status: "done" | "warning" | "critical";
  time: string;
  detail: string;
  evidence: { key: string; value: string }[];
  policyChecks?: { name: string; passed: boolean; detail: string }[];
}

export interface Analysis {
  riskScore: number; // 0-100
  confidence: number; // 0-100
  anomalyIndex: number; // 0-1
  policyCompliancePassed: number;
  policyComplianceTotal: number;
  flags: Flag[];
  trace: TraceItem[];
  decision: Decision;
  nodes: NodeOutput[];
  traceId: string;
}

export interface Policies {
  maxPayment: number;
  blockUnknownVendors: boolean;
  dualApprovalThreshold: number;
  amountAnomalyMultiplier: number; // x times vendor avg → flag
  knownVendors: string[];
  vendorAverages: Record<string, number>;
}

export interface AuditEntry {
  id: string;
  ts: string;
  type: "UPLOAD" | "ANALYSIS" | "RISK" | "DECISION" | "POLICY_CHANGE" | "USER_ACTION" | "ALERT";
  actor: string;
  message: string;
  meta?: Record<string, unknown>;
}

export type UserAction = "review" | "block" | "approve";

interface AegisState {
  invoices: Invoice[];
  currentInvoiceId: string | null;
  analysis: Analysis | null;
  policies: Policies;
  audit: AuditEntry[];
  alertOpen: boolean;
  lastUserAction: UserAction | null;
  finalStatus: "PENDING" | "APPROVED" | "BLOCKED" | "UNDER_REVIEW";

  addInvoice: (invoice: Invoice) => void;
  selectInvoice: (id: string) => void;
  setAnalysis: (a: Analysis) => void;
  updatePolicy: <K extends keyof Policies>(key: K, value: Policies[K]) => void;
  log: (entry: Omit<AuditEntry, "id" | "ts">) => void;
  openAlert: () => void;
  closeAlert: () => void;
  resolveAlert: (action: UserAction) => void;
  reset: () => void;
}

const seedInvoice: Invoice = {
  id: "inv-2026-0481",
  fileName: "INV-2026-0481.pdf",
  vendor: "NorthStar Logistics LTD",
  amount: 9450,
  date: "2026-05-06",
  invoiceNumber: "2026-0481",
  rawText: "Invoice #2026-0481\nFrom: NorthStar Logistics LTD\nTotal: $9,450.00",
  uploadedAt: new Date().toISOString(),
};

const initialPolicies: Policies = {
  maxPayment: 10000,
  blockUnknownVendors: false,
  dualApprovalThreshold: 5000,
  amountAnomalyMultiplier: 1.3,
  knownVendors: ["Acme Industries", "Globex Corp", "Initech LLC", "NorthStar Logistics Inc"],
  vendorAverages: {
    "NorthStar Logistics Inc": 6990,
    "Acme Industries": 4200,
    "Globex Corp": 3100,
  },
};

export const useAegis = create<AegisState>((set, get) => ({
  invoices: [seedInvoice],
  currentInvoiceId: seedInvoice.id,
  analysis: null,
  policies: initialPolicies,
  audit: [
    {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      type: "UPLOAD",
      actor: "system",
      message: `Seed invoice ${seedInvoice.fileName} loaded`,
    },
  ],
  alertOpen: false,
  lastUserAction: null,
  finalStatus: "PENDING",

  addInvoice: (invoice) =>
    set((s) => ({
      invoices: [invoice, ...s.invoices.filter((i) => i.id !== invoice.id)],
      currentInvoiceId: invoice.id,
      finalStatus: "PENDING",
      lastUserAction: null,
    })),
  selectInvoice: (id) => set({ currentInvoiceId: id }),
  setAnalysis: (a) => set({ analysis: a }),
  updatePolicy: (key, value) => {
    set((s) => ({ policies: { ...s.policies, [key]: value } }));
    get().log({
      type: "POLICY_CHANGE",
      actor: "M. Chen",
      message: `Policy "${String(key)}" changed`,
      meta: { key, value },
    });
  },
  log: (entry) =>
    set((s) => ({
      audit: [
        { id: crypto.randomUUID(), ts: new Date().toISOString(), ...entry },
        ...s.audit,
      ].slice(0, 500),
    })),
  openAlert: () => set({ alertOpen: true }),
  closeAlert: () => set({ alertOpen: false }),
  resolveAlert: (action) => {
    const map = { review: "UNDER_REVIEW", block: "BLOCKED", approve: "APPROVED" } as const;
    set({ alertOpen: false, lastUserAction: action, finalStatus: map[action] });
    get().log({
      type: "USER_ACTION",
      actor: "M. Chen",
      message: `User selected: ${action.toUpperCase()}`,
      meta: { action, finalStatus: map[action] },
    });
  },
  reset: () => set({ analysis: null, finalStatus: "PENDING", lastUserAction: null }),
}));
