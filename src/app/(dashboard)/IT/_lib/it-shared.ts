import { type ITAsset, type ITTicket, type TicketCategory, type TicketPriority, type TicketIssueType, type TicketAssetIssue } from "./it-types"

type RawTicket = Partial<ITTicket> & {
  id?: string
  _id?: string
  title?: string
  department?: string
  createdAt?: string
  issueType?: TicketIssueType
  assetIssue?: TicketAssetIssue | null
  assignedTo?: {
    id?: string
    _id?: string
    name?: string
    email?: string
    role?: string
  } | null
}
type RawAsset = Partial<ITAsset> & { id?: string; serialNumber?: string; assetName?: string; createdAt?: string }

export const PRIORITY_DEADLINE_DAYS: Record<TicketPriority, number> = { CRITICAL: 1, HIGH: 3, LOW: 7 }
export const ASSET_THRESHOLDS: Record<ITAsset["assetType"], number> = { HARDWARE: 5, SOFTWARE: 5, NETWORK: 3 }

const NETWORK_KEYWORDS = ["network", "wifi", "wi-fi", "vpn", "lan", "wan", "router", "switch", "internet"]
const SOFTWARE_KEYWORDS = ["software", "application", "app", "license", "login", "email", "outlook", "teams", "excel", "word", "browser"]

function hasText(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0
}

function deriveIssueType(ticket: RawTicket): TicketIssueType {
  const issue = ticket.assetIssue
  if (!issue) return "GENERAL"

  // Workflow rule: asset reference means problem, missing reference means request.
  if (hasText(issue.assetId) || hasText(issue.assetSerial)) return "ASSET_PROBLEM"
  return "ASSET_REQUEST"
}

export function resolveTicketIssueType(ticket: Pick<ITTicket, "issueType" | "assetIssue">): TicketIssueType {
  if (ticket.issueType === "GENERAL" || ticket.issueType === "ASSET_REQUEST" || ticket.issueType === "ASSET_PROBLEM") {
    return ticket.issueType
  }
  return deriveIssueType(ticket as RawTicket)
}

export function normalizeTicket(raw: unknown): ITTicket {
  const ticket = (raw ?? {}) as RawTicket
  const assignedToId = ticket.assignedToId ?? ticket.assignedTo?.id ?? ticket.assignedTo?._id ?? null
  const resolvedIssueType = resolveTicketIssueType(ticket as Pick<ITTicket, "issueType" | "assetIssue">)
  return {
    id: ticket.id || ticket._id || "",
    title: ticket.title || "Untitled Ticket",
    summary: ticket.summary || "",
    department: ticket.department || "IT",
    issueType: resolvedIssueType,
    assetIssue: ticket.assetIssue
      ? {
        ...ticket.assetIssue,
        assetId: ticket.assetIssue.assetId ?? null,
        assetSerial: ticket.assetIssue.assetSerial ?? null,
        assetCategory: ticket.assetIssue.assetCategory ?? null,
        assetClassification: ticket.assetIssue.assetClassification ?? null,
        requestedAssetName: ticket.assetIssue.requestedAssetName ?? null,
      }
      : null,
    status: ticket.status || "OPEN",
    priority: ticket.priority || "LOW",
    createdAt: ticket.createdAt || new Date().toISOString(),
    createdById: ticket.createdById,
    assignedToId,
    createdBy: ticket.createdBy,
    assignedTo: ticket.assignedTo,
  }
}

export function normalizeAsset(raw: unknown): ITAsset {
  const asset = (raw ?? {}) as RawAsset
  return {
    id: asset.id || "",
    serialNumber: asset.serialNumber || "N/A",
    assetName: asset.assetName || "Unnamed Asset",
    assetType: asset.assetType || "HARDWARE",
    assetStatus: asset.assetStatus || "AVAILABLE",
    assignedToId: asset.assignedToId ?? null,
    createdAt: asset.createdAt || new Date().toISOString(),
    assignedTo: asset.assignedTo ?? null,
  }
}

export function inferTicketCategory(ticket: Pick<ITTicket, "title" | "summary">): TicketCategory {
  const issueType = resolveTicketIssueType(ticket as Pick<ITTicket, "issueType" | "assetIssue">)
  const classification = (ticket as ITTicket).assetIssue?.assetClassification?.trim().toUpperCase()
  if (classification === "NETWORK") return "NETWORK"
  if (classification === "SOFTWARE") return "SOFTWARE"
  if (classification === "HARDWARE") return "HARDWARE"

  const category = (ticket as ITTicket).assetIssue?.assetCategory?.trim().toUpperCase()
  if (category === "NETWORK") return "NETWORK"
  if (category === "SOFTWARE") return "SOFTWARE"
  if (category === "HARDWARE") return "HARDWARE"

  // General IT tickets are still mapped into one of the 3 IT categories.
  if (issueType === "GENERAL") {
    const text = `${ticket.title || ""} ${ticket.summary || ""}`.toLowerCase()
    if (NETWORK_KEYWORDS.some((keyword) => text.includes(keyword))) return "NETWORK"
    if (SOFTWARE_KEYWORDS.some((keyword) => text.includes(keyword))) return "SOFTWARE"
  }

  // Asset tickets without explicit classification default to hardware.
  if (issueType === "ASSET_REQUEST" || issueType === "ASSET_PROBLEM") return "HARDWARE"
  return "HARDWARE"
}

export function isOverdue(ticket: ITTicket): boolean {
  if (ticket.status === "RESOLVED") return false
  const created = new Date(ticket.createdAt).getTime()
  if (!created) return false
  return Date.now() > created + PRIORITY_DEADLINE_DAYS[ticket.priority] * 24 * 60 * 60 * 1000
}

export function getDeadlineLabel(priority: TicketPriority): string {
  if (priority === "CRITICAL") return "1 day SLA"
  if (priority === "HIGH") return "3 days SLA"
  return "7 days SLA"
}

export function getMemberLoad(tickets: ITTicket[], memberId: string) {
  return tickets.filter((ticket) => ticket.assignedToId === memberId && (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS")).length
}

export function toArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (
    payload
    && typeof payload === "object"
    && "data" in payload
    && Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data
  }
  return []
}

export type { ITAsset, ITTicket, TicketCategory, TicketPriority, ITUser, TicketIssueType, TicketAssetIssue } from "./it-types"
export { getCurrentUser, isAnyITRole, isITAdmin, isITSupport, normalizeITRole, type ITAccessRole } from "./it-session"
