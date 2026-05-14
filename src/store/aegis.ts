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
  riskScore: number;
  confidence: number;
  anomalyIndex: number;
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
  amountAnomalyMultiplier: number;
  knownVendors: string[];
  vendorAverages: Record<string, number>;
}

export type PolicySnapshot = Omit<Policies, "knownVendors" | "vendorAverages">;

export interface AuditEntry {
  id: string;
  ts: string;
  type: "UPLOAD" | "ANALYSIS" | "RISK" | "DECISION" | "POLICY_CHANGE" | "USER_ACTION" | "ALERT";
  actor: string;
  message: string;
  meta?: Record<string, unknown>;
  invoiceId?: string | null;
  policiesSnapshot?: PolicySnapshot;
  policyChecksSnapshot?: { name: string; passed: boolean }[];
}

export type UserAction = "review" | "block" | "approve";
export type FinalStatus = "PENDING" | "APPROVED" | "BLOCKED" | "UNDER_REVIEW";

interface InvoiceState {
  analysis: Analysis | null;
  finalStatus: FinalStatus;
  lastUserAction: UserAction | null;
}

interface AegisState {
  invoices: Invoice[];
  currentInvoiceId: string | null;
  byInvoice: Record<string, InvoiceState>;
  policies: Policies;
  audit: AuditEntry[];
  alertOpen: boolean;

  // derived getters
  analysis: Analysis | null;
  finalStatus: FinalStatus;
  lastUserAction: UserAction | null;

  addInvoice: (invoice: Invoice) => void;
  selectInvoice: (id: string) => void;
  setAnalysis: (a: Analysis) => void;
  updatePolicy: <K extends keyof Policies>(key: K, value: Policies[K]) => void;
  log: (entry: Omit<AuditEntry, "id" | "ts" | "policiesSnapshot" | "invoiceId"> & { invoiceId?: string | null }) => void;
  openAlert: () => void;
  closeAlert: () => void;
  resolveAlert: (action: UserAction) => void;
  auditForInvoice: (id: string | null) => AuditEntry[];
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

function snapshot(p: Policies): PolicySnapshot {
  return {
    maxPayment: p.maxPayment,
    blockUnknownVendors: p.blockUnknownVendors,
    dualApprovalThreshold: p.dualApprovalThreshold,
    amountAnomalyMultiplier: p.amountAnomalyMultiplier,
  };
}

const initialInvoiceState: InvoiceState = { analysis: null, finalStatus: "PENDING", lastUserAction: null };

export const useAegis = create<AegisState>((set, get) => ({
  invoices: [seedInvoice],
  currentInvoiceId: seedInvoice.id,
  byInvoice: { [seedInvoice.id]: { ...initialInvoiceState } },
  policies: initialPolicies,
  audit: [
    {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      type: "UPLOAD",
      actor: "system",
      message: `Seed invoice ${seedInvoice.fileName} loaded`,
      invoiceId: seedInvoice.id,
      policiesSnapshot: snapshot(initialPolicies),
    },
  ],
  alertOpen: false,

  get analysis() {
    const id = get().currentInvoiceId;
    return id ? get().byInvoice[id]?.analysis ?? null : null;
  },
  get finalStatus() {
    const id = get().currentInvoiceId;
    return id ? get().byInvoice[id]?.finalStatus ?? "PENDING" : "PENDING";
  },
  get lastUserAction() {
    const id = get().currentInvoiceId;
    return id ? get().byInvoice[id]?.lastUserAction ?? null : null;
  },

  addInvoice: (invoice) =>
    set((s) => ({
      invoices: [invoice, ...s.invoices.filter((i) => i.id !== invoice.id)],
      currentInvoiceId: invoice.id,
      byInvoice: { ...s.byInvoice, [invoice.id]: { ...initialInvoiceState } },
    })),
  selectInvoice: (id) => set({ currentInvoiceId: id }),
  setAnalysis: (a) =>
    set((s) => {
      const id = s.currentInvoiceId;
      if (!id) return {};
      const prev = s.byInvoice[id] ?? { ...initialInvoiceState };
      return { byInvoice: { ...s.byInvoice, [id]: { ...prev, analysis: a } } };
    }),
  updatePolicy: (key, value) => {
    set((s) => ({ policies: { ...s.policies, [key]: value } }));
    get().log({
      type: "POLICY_CHANGE",
      actor: "M. Chen",
      message: `Policy "${String(key)}" changed → ${String(value)}`,
      meta: { key, value },
    });
  },
  log: (entry) => {
    const s = get();
    const invoiceId = entry.invoiceId !== undefined ? entry.invoiceId : s.currentInvoiceId;
    const inv = invoiceId ? s.byInvoice[invoiceId] : null;
    const checks = inv?.analysis?.nodes.find((n) => n.id === "decision")?.policyChecks
      ?.map((c) => ({ name: c.name, passed: c.passed }));
    set((st) => ({
      audit: [
        {
          id: crypto.randomUUID(),
          ts: new Date().toISOString(),
          policiesSnapshot: snapshot(st.policies),
          policyChecksSnapshot: checks,
          invoiceId,
          ...entry,
        },
        ...st.audit,
      ].slice(0, 500),
    }));
  },
  openAlert: () => set({ alertOpen: true }),
  closeAlert: () => set({ alertOpen: false }),
  resolveAlert: (action) => {
    const map = { review: "UNDER_REVIEW", block: "BLOCKED", approve: "APPROVED" } as const;
    set((s) => {
      const id = s.currentInvoiceId;
      if (!id) return { alertOpen: false };
      const prev = s.byInvoice[id] ?? { ...initialInvoiceState };
      return {
        alertOpen: false,
        byInvoice: { ...s.byInvoice, [id]: { ...prev, lastUserAction: action, finalStatus: map[action] } },
      };
    });
    get().log({
      type: "USER_ACTION",
      actor: "M. Chen",
      message: `User selected: ${action.toUpperCase()}`,
      meta: { action, finalStatus: map[action] },
    });
  },
  auditForInvoice: (id) =>
    id ? get().audit.filter((e) => e.invoiceId === id || e.invoiceId == null && e.type === "POLICY_CHANGE") : get().audit,
  reset: () =>
    set((s) => {
      const id = s.currentInvoiceId;
      if (!id) return {};
      return { byInvoice: { ...s.byInvoice, [id]: { ...initialInvoiceState } } };
    }),
}));
