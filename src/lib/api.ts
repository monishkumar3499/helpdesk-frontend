// lib/api.ts  — Unified API layer for all dashboards (HR, IT, Employee)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
const MOCK_DB_KEY = "helpdesk_mock_db_v1";

// ─── Unified auth token key ───────────────────────────────────────────────────
// Single source of truth: all dashboards read the token from "authToken"
const ACCESS_TOKEN_KEY = "authToken";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
type TicketPriority = "CRITICAL" | "HIGH" | "LOW";
type Department = "HR" | "IT";
type TicketIssueType = "GENERAL" | "ASSET_REQUEST" | "ASSET_PROBLEM";
type AssetType = "SOFTWARE" | "HARDWARE" | "NETWORK";
type AssetStatus = "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED";
type Role = "EMPLOYEE" | "HR" | "IT_SUPPORT" | "IT_ADMIN" | "ADMIN";

type MockUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

type MockTicket = {
  id: string;
  title: string;
  summary: string;
  description?: string;
  issueType?: TicketIssueType;
  assetIssue?: {
    assetId?: string | null;
    assetCategory?: string | null;
    assetClassification?: AssetType | null;
    requestedAssetName?: string | null;
  } | null;
  status: TicketStatus;
  priority: TicketPriority;
  department: Department;
  createdAt: string;
  createdById?: string;
  assignedToId?: string | null;
  hrComment?: string;
  rejectedReason?: string;
};

type MockAsset = {
  id: string;
  serialNumber: string;
  assetName: string;
  assetType: AssetType;
  assetStatus: AssetStatus;
  assignedToId?: string | null;
  createdAt: string;
};

type MockDb = {
  users: MockUser[];
  tickets: MockTicket[];
  assets: MockAsset[];
};

type LegacyRole = Role | "IT";

// ─── Mock seed data ───────────────────────────────────────────────────────────

let cache: MockDb | null = null;

function nowIso() {
  return new Date().toISOString();
}

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function createSeedData(): MockDb {
  const users: MockUser[] = [
    { id: "u-hr-1", name: "Priya Nair", email: "priya.nair@company.com", role: "HR", isActive: true, createdAt: "2024-01-05T09:00:00.000Z" },
    { id: "it-admin-1", name: "Nikhil Ops", email: "it.admin@company.com", role: "IT_ADMIN", isActive: true, createdAt: "2024-01-08T09:00:00.000Z" },
    { id: "it-1", name: "Asha IT", email: "asha.it@company.com", role: "IT_SUPPORT", isActive: true, createdAt: "2024-02-10T09:00:00.000Z" },
    { id: "it-2", name: "Ravi IT", email: "ravi.it@company.com", role: "IT_SUPPORT", isActive: true, createdAt: "2024-02-15T09:00:00.000Z" },
    { id: "it-3", name: "Meena IT", email: "meena.it@company.com", role: "IT_SUPPORT", isActive: true, createdAt: "2024-03-03T09:00:00.000Z" },
    { id: "it-4", name: "Sanjay IT", email: "sanjay.it@company.com", role: "IT_SUPPORT", isActive: true, createdAt: "2024-03-12T09:00:00.000Z" },
    { id: "it-5", name: "Kiran IT", email: "kiran.it@company.com", role: "IT_SUPPORT", isActive: true, createdAt: "2024-04-01T09:00:00.000Z" },
    { id: "emp-1", name: "Aarav Sharma", email: "aarav.sharma@company.com", role: "EMPLOYEE", isActive: true, createdAt: "2024-01-17T09:00:00.000Z" },
    { id: "emp-2", name: "Sneha Pillai", email: "sneha.pillai@company.com", role: "EMPLOYEE", isActive: true, createdAt: "2024-02-09T09:00:00.000Z" },
    { id: "emp-3", name: "Rohan Mehta", email: "rohan.mehta@company.com", role: "EMPLOYEE", isActive: false, createdAt: "2023-12-19T09:00:00.000Z" },
    { id: "emp-4", name: "Kiran Raj", email: "kiran.raj@company.com", role: "EMPLOYEE", isActive: true, createdAt: "2024-03-22T09:00:00.000Z" },
  ];

  const tickets: MockTicket[] = [
    { id: "hr-1", title: "Leave Request", summary: "Need 3 days sick leave due to fever", status: "OPEN", priority: "HIGH", department: "HR", createdAt: hoursAgoIso(22), createdById: "emp-1" },
    { id: "hr-2", title: "Payroll Issue", summary: "Salary amount is lower than expected", status: "IN_PROGRESS", priority: "CRITICAL", department: "HR", createdAt: hoursAgoIso(14), createdById: "emp-4" },
    { id: "hr-3", title: "Onboarding Documents", summary: "Need checklist for joining formalities", status: "RESOLVED", priority: "LOW", department: "HR", createdAt: hoursAgoIso(70), createdById: "emp-2", hrComment: "Shared checklist and completed verification." },
    { id: "hr-4", title: "Benefits Enrollment", summary: "Unable to enroll in medical insurance", status: "REJECTED", priority: "HIGH", department: "HR", createdAt: hoursAgoIso(45), createdById: "emp-3", rejectedReason: "Enrollment window closed. Please apply in next cycle.", hrComment: "Enrollment window closed. Please apply in next cycle." },

    { id: "it-101", title: "Laptop not booting", summary: "Device shows blue screen after update", status: "OPEN", priority: "CRITICAL", department: "IT", createdAt: hoursAgoIso(10), createdById: "emp-1", assignedToId: "it-2" },
    { id: "it-102", title: "VPN access issue", summary: "Unable to connect to office VPN from home", status: "OPEN", priority: "HIGH", department: "IT", createdAt: hoursAgoIso(28), createdById: "emp-2", assignedToId: "it-3" },
    { id: "it-103", title: "Need MS Project license", summary: "Requesting software license for planning work", status: "IN_PROGRESS", priority: "LOW", department: "IT", createdAt: hoursAgoIso(36), createdById: "emp-4", assignedToId: "it-1" },
    { id: "it-104", title: "Printer jam on 3rd floor", summary: "Paper jam and error E23 visible", status: "IN_PROGRESS", priority: "HIGH", department: "IT", createdAt: hoursAgoIso(7), createdById: "emp-3", assignedToId: "it-4" },
    { id: "it-105", title: "Wi-Fi signal weak", summary: "Network drops frequently in conference room", status: "RESOLVED", priority: "LOW", department: "IT", createdAt: hoursAgoIso(80), createdById: "emp-2", assignedToId: "it-5" },
    { id: "it-106", title: "New monitor request", summary: "Need dual-monitor setup for analytics work", status: "OPEN", priority: "LOW", department: "IT", createdAt: hoursAgoIso(18), createdById: "emp-1", assignedToId: "it-1" },
    { id: "it-107", title: "Asset request: 27 inch monitor", summary: "Need one monitor for reporting desk", issueType: "ASSET_REQUEST", assetIssue: { assetCategory: "HARDWARE", assetClassification: "HARDWARE", requestedAssetName: "27 inch Monitor", assetId: null }, status: "OPEN", priority: "LOW", department: "IT", createdAt: hoursAgoIso(12), createdById: "emp-4", assignedToId: "it-2" },
    { id: "it-108", title: "Asset problem: Cisco AP unstable", summary: "The access point restarts every hour", issueType: "ASSET_PROBLEM", assetIssue: { assetCategory: "NETWORK", assetClassification: "NETWORK", assetId: "asset-6" }, status: "IN_PROGRESS", priority: "HIGH", department: "IT", createdAt: hoursAgoIso(9), createdById: "emp-2", assignedToId: "it-3" },
    { id: "it-109", title: "Asset request: docking station for hybrid setup", summary: "Need a USB-C docking station with dual display output for WFH days", issueType: "ASSET_REQUEST", assetIssue: { assetCategory: "HARDWARE", assetClassification: "HARDWARE", requestedAssetName: "USB-C Docking Station", assetId: null }, status: "OPEN", priority: "HIGH", department: "IT", createdAt: hoursAgoIso(6), createdById: "emp-1", assignedToId: "it-4" },
    { id: "it-110", title: "Asset request: Adobe Acrobat Pro license", summary: "Requesting license for contract review and PDF redaction", issueType: "ASSET_REQUEST", assetIssue: { assetCategory: "SOFTWARE", assetClassification: "SOFTWARE", requestedAssetName: "Adobe Acrobat Pro", assetId: null }, status: "IN_PROGRESS", priority: "LOW", department: "IT", createdAt: hoursAgoIso(20), createdById: "emp-4", assignedToId: "it-1" },
    { id: "it-111", title: "Asset problem: ThinkPad battery draining fast", summary: "Laptop battery drops from 100% to 40% in under an hour", issueType: "ASSET_PROBLEM", assetIssue: { assetCategory: "HARDWARE", assetClassification: "HARDWARE", assetId: "asset-3" }, status: "OPEN", priority: "CRITICAL", department: "IT", createdAt: hoursAgoIso(5), createdById: "emp-2", assignedToId: "it-2" },
    { id: "it-112", title: "Asset problem: M365 activation keeps failing", summary: "Office apps show activation required even after sign in", issueType: "ASSET_PROBLEM", assetIssue: { assetCategory: "SOFTWARE", assetClassification: "SOFTWARE", assetId: "asset-4" }, status: "IN_PROGRESS", priority: "HIGH", department: "IT", createdAt: hoursAgoIso(16), createdById: "emp-1", assignedToId: "it-5" },
    { id: "it-113", title: "Asset request: replacement ergonomic keyboard", summary: "Current keyboard has multiple non-working keys; requesting replacement", issueType: "ASSET_REQUEST", assetIssue: { assetCategory: "HARDWARE", assetClassification: "HARDWARE", requestedAssetName: "Ergonomic Keyboard", assetId: null }, status: "RESOLVED", priority: "LOW", department: "IT", createdAt: hoursAgoIso(52), createdById: "emp-3", assignedToId: "it-3" },
    { id: "it-114", title: "Asset request: 27 inch monitor", summary: "Need one monitor for reporting desk", issueType: "ASSET_REQUEST", assetIssue: { assetCategory: "HARDWARE", assetClassification: "HARDWARE", requestedAssetName: "27 inch Monitor", assetId: null }, status: "OPEN", priority: "LOW", department: "IT", createdAt: hoursAgoIso(12), createdById: "emp-4", assignedToId: "it-2" },
  ];

  const assets: MockAsset[] = [
    { id: "asset-1", serialNumber: "AST-HA-110201", assetName: "Dell Latitude 5440", assetType: "HARDWARE", assetStatus: "ASSIGNED", assignedToId: "emp-1", createdAt: hoursAgoIso(500) },
    { id: "asset-2", serialNumber: "AST-HA-110202", assetName: "HP EliteBook 840", assetType: "HARDWARE", assetStatus: "AVAILABLE", createdAt: hoursAgoIso(420) },
    { id: "asset-3", serialNumber: "AST-HA-110203", assetName: "Lenovo ThinkPad T14", assetType: "HARDWARE", assetStatus: "AVAILABLE", createdAt: hoursAgoIso(380) },
    { id: "asset-4", serialNumber: "AST-SO-220101", assetName: "Microsoft 365 License", assetType: "SOFTWARE", assetStatus: "ASSIGNED", assignedToId: "emp-4", createdAt: hoursAgoIso(900) },
    { id: "asset-5", serialNumber: "AST-SO-220102", assetName: "Adobe Acrobat Pro License", assetType: "SOFTWARE", assetStatus: "AVAILABLE", createdAt: hoursAgoIso(250) },
    { id: "asset-6", serialNumber: "AST-NW-330001", assetName: "Cisco Access Point", assetType: "NETWORK", assetStatus: "MAINTENANCE", createdAt: hoursAgoIso(750) },
    { id: "asset-7", serialNumber: "AST-NW-330002", assetName: "Fortinet Firewall", assetType: "NETWORK", assetStatus: "AVAILABLE", createdAt: hoursAgoIso(600) },
    { id: "asset-8", serialNumber: "AST-HA-110204", assetName: "27 inch Monitor", assetType: "HARDWARE", assetStatus: "AVAILABLE", createdAt: hoursAgoIso(140) },
    { id: "asset-9", serialNumber: "AST-HA-110205", assetName: "27 inch Monitor", assetType: "HARDWARE", assetStatus: "AVAILABLE", createdAt: hoursAgoIso(130) },
  ];

  return { users, tickets, assets };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeLegacyRole(role: LegacyRole): Role {
  if (role === "IT") return "IT_SUPPORT";
  return role;
}

function migrateDb(db: MockDb): MockDb {
  const seed = createSeedData();
  const mergedUsers = db.users.map((u) => ({ ...u, role: normalizeLegacyRole(u.role as LegacyRole) }));
  const existingUserIds = new Set(mergedUsers.map((u) => u.id));
  seed.users.forEach((u) => { if (!existingUserIds.has(u.id)) mergedUsers.push(u); });
  const mergedTickets = [...db.tickets];
  const existingTicketIds = new Set(mergedTickets.map((t) => t.id));
  seed.tickets.forEach((t) => { if (!existingTicketIds.has(t.id)) mergedTickets.push(t); });
  const mergedAssets = [...db.assets];
  const existingAssetIds = new Set(mergedAssets.map((a) => a.id));
  seed.assets.forEach((a) => { if (!existingAssetIds.has(a.id)) mergedAssets.push(a); });
  return { ...db, users: mergedUsers, tickets: mergedTickets, assets: mergedAssets };
}

function loadDb(): MockDb {
  if (cache) return cache;
  if (typeof window === "undefined") { cache = createSeedData(); return cache; }
  const raw = window.localStorage.getItem(MOCK_DB_KEY);
  if (!raw) { cache = createSeedData(); window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(cache)); return cache; }
  try { cache = migrateDb(JSON.parse(raw) as MockDb); window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(cache)); }
  catch { cache = createSeedData(); window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(cache)); }
  return cache;
}

function persistDb(db: MockDb) {
  cache = db;
  if (typeof window !== "undefined") window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
}

function parseJsonBody(options?: RequestInit): Record<string, unknown> {
  if (!options?.body || typeof options.body !== "string") return {};
  try { return JSON.parse(options.body) as Record<string, unknown>; } catch { return {}; }
}

function enrichTicket(ticket: MockTicket, db: MockDb) {
  const createdBy = db.users.find((u) => u.id === ticket.createdById);
  const assignedTo = db.users.find((u) => u.id === ticket.assignedToId);
  return {
    ...ticket,
    createdBy: createdBy ? { id: createdBy.id, name: createdBy.name, email: createdBy.email, role: createdBy.role } : undefined,
    assignedTo: assignedTo ? { id: assignedTo.id, name: assignedTo.name, email: assignedTo.email, role: assignedTo.role } : null,
  };
}

function enrichAsset(asset: MockAsset, db: MockDb) {
  const assignedTo = db.users.find((u) => u.id === asset.assignedToId);
  return { ...asset, assignedTo: assignedTo ? { id: assignedTo.id, name: assignedTo.name, email: assignedTo.email } : null };
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function mockFetch(endpoint: string, options?: RequestInit) {
  const db = loadDb();
  const method = (options?.method || "GET").toUpperCase();
  const url = new URL(endpoint, "http://mock.local");
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/tickets") {
    const department = url.searchParams.get("department");
    const createdById = url.searchParams.get("createdById");
    const filtered = department ? db.tickets.filter((t) => t.department === department) : db.tickets;
    const scoped = createdById ? filtered.filter((t) => t.createdById === createdById) : filtered;
    return delay({ data: clone(scoped.map((t) => enrichTicket(t, db))) });
  }

  if (method === "GET" && pathname === "/tickets/mine") {
    const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    // In mock mode we can't decode the JWT, so return all employee tickets
    return delay({ data: clone(db.tickets.map((t) => enrichTicket(t, db))) });
  }

  if (method === "POST" && pathname === "/tickets") {
    const body = parseJsonBody(options);
    const nextTicket: MockTicket = {
      id: `it-${Math.floor(Date.now() / 1000).toString().slice(-6)}`,
      title: (body.title as string | undefined) || "Untitled Ticket",
      summary: (body.summary as string | undefined) || "",
      description: body.description as string | undefined,
      issueType: (body.issueType as TicketIssueType | undefined) || "GENERAL",
      assetIssue: (body.assetIssue as MockTicket["assetIssue"] | undefined) || null,
      status: "OPEN",
      priority: (body.priority as TicketPriority | undefined) || "LOW",
      department: (body.department as Department | undefined) || "IT",
      createdAt: nowIso(),
      createdById: body.createdById as string | undefined,
      assignedToId: (body.assignedToId as string | null | undefined) ?? null,
    };
    const next = [nextTicket, ...db.tickets];
    persistDb({ ...db, tickets: next });
    return delay(clone(enrichTicket(nextTicket, { ...db, tickets: next })));
  }

  if (method === "PATCH" && pathname.match(/^\/tickets\/[^/]+\/status$/)) {
    const id = pathname.split("/")[2];
    const body = parseJsonBody(options);
    const status = body.status as TicketStatus | undefined;
    const next = db.tickets.map((t) => t.id === id && status ? { ...t, status } : t);
    persistDb({ ...db, tickets: next });
    return delay(clone(enrichTicket(next.find((t) => t.id === id) || db.tickets[0], { ...db, tickets: next })));
  }

  if (method === "PATCH" && pathname.match(/^\/tickets\/[^/]+$/)) {
    const id = pathname.split("/")[2];
    const body = parseJsonBody(options);
    const next = db.tickets.map((t) =>
      t.id === id
        ? { ...t, status: (body.status as TicketStatus | undefined) || t.status, assignedToId: (body.assignedToId as string | null | undefined) ?? t.assignedToId, assetIssue: (body.assetIssue as MockTicket["assetIssue"] | undefined) ?? t.assetIssue }
        : t
    );
    persistDb({ ...db, tickets: next });
    return delay(clone(enrichTicket(next.find((t) => t.id === id) || db.tickets[0], { ...db, tickets: next })));
  }

  if (method === "PATCH" && pathname.match(/^\/assets\/[^/]+$/)) {
    const id = pathname.split("/")[2];
    const body = parseJsonBody(options);
    const next = db.assets.map((a) => a.id === id ? { ...a, assetStatus: (body.assetStatus as AssetStatus | undefined) || a.assetStatus, assignedToId: (body.assignedToId as string | null | undefined) ?? a.assignedToId } : a);
    persistDb({ ...db, assets: next });
    return delay(clone(enrichAsset(next.find((a) => a.id === id) || db.assets[0], { ...db, assets: next })));
  }

  if (method === "GET" && pathname === "/users") {
    const role = url.searchParams.get("role");
    const filtered = role ? db.users.filter((u) => u.role === role || (role === "IT" && u.role === "IT_SUPPORT")) : db.users;
    return delay({ data: clone(filtered) });
  }

  if (method === "GET" && pathname === "/assets") {
    return delay({ data: clone(db.assets.map((a) => enrichAsset(a, db))) });
  }

  if (method === "POST" && pathname === "/assets") {
    const body = parseJsonBody(options);
    const nextAsset: MockAsset = {
      id: `asset-${db.assets.length + 1}`,
      serialNumber: (body.serialNumber as string | undefined) || `AST-XX-${Date.now().toString().slice(-6)}`,
      assetName: (body.assetName as string | undefined) || "New Asset",
      assetType: (body.assetType as AssetType | undefined) || "HARDWARE",
      assetStatus: "AVAILABLE",
      createdAt: nowIso(),
    };
    const next = [...db.assets, nextAsset];
    persistDb({ ...db, assets: next });
    return delay(clone(enrichAsset(nextAsset, { ...db, assets: next })));
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${pathname}`);
}

// ─── API Error class ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Config type (from IT dashboard) ─────────────────────────────────────────

type ApiFetchConfig = {
  forceBackend?: boolean;
};

// ─── Universal apiFetch ───────────────────────────────────────────────────────
// Supports both call signatures:
//   apiFetch(endpoint)
//   apiFetch(endpoint, options)
//   apiFetch(endpoint, options, { forceBackend: true })  ← IT dashboard style

export async function apiFetch(
  endpoint: string,
  options?: RequestInit,
  config?: ApiFetchConfig,
): Promise<any> {
  const shouldUseMock = USE_MOCK_API && !config?.forceBackend;
  if (shouldUseMock) {
    return mockFetch(endpoint, options);
  }

  const headers = new Headers(options?.headers ?? {});

  // Don't set Content-Type for FormData (let browser set multipart boundary)
  if (options?.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Inject JWT token — reads from unified key "authToken"
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Handle 401 — clear session and redirect
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized", "Session expired");
  }

  if (response.status === 403) {
    throw new ApiError(403, "Forbidden", "You don't have permission to access this resource");
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try { errorData = await response.json(); } catch { /* ignore */ }
    throw new ApiError(
      response.status,
      errorData?.message || `HTTP ${response.status}`,
      errorData?.error || response.statusText
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}