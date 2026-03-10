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

function hasText(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0
}

function deriveIssueType(ticket: RawTicket): TicketIssueType {
  const issue = ticket.assetIssue
  if (!issue) return "GENERAL"

  const category = issue.assetCategory?.trim().toUpperCase()
  if (category === "ASSET_PROBLEM") return "ASSET_PROBLEM"
  if (category === "ASSET_REQUEST") return "ASSET_REQUEST"

  const hasAssetId = hasText(issue.assetId)
  const hasRequestedAssetName = hasText(issue.requestedAssetName)
  const hasCategory = hasText(issue.assetCategory)
  const hasClassification = hasText(issue.assetClassification)

  if (hasAssetId && hasRequestedAssetName && hasCategory && hasClassification) return "ASSET_PROBLEM"
  if (!hasAssetId && hasRequestedAssetName && hasCategory && hasClassification) return "ASSET_REQUEST"
  if (hasAssetId) return "ASSET_PROBLEM"
  if (hasRequestedAssetName) return "ASSET_REQUEST"
  return "GENERAL"
}

export function normalizeTicket(raw: unknown): ITTicket {
  const ticket = (raw ?? {}) as RawTicket
  const assignedToId = ticket.assignedToId ?? ticket.assignedTo?.id ?? ticket.assignedTo?._id ?? null
  return {
    id: ticket.id || ticket._id || "",
    title: ticket.title || "Untitled Ticket",
    summary: ticket.summary || "",
    department: ticket.department || "IT",
    issueType: ticket.issueType || deriveIssueType(ticket),
    assetIssue: ticket.assetIssue || null,
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
  if ((ticket as ITTicket).issueType === "ASSET_REQUEST") return "ASSET_REQUEST"
  if ((ticket as ITTicket).issueType === "ASSET_PROBLEM") {
    const classification = (ticket as ITTicket).assetIssue?.assetClassification
    if (classification === "NETWORK") return "NETWORK"
    if (classification === "SOFTWARE") return "SOFTWARE"
    if (classification === "HARDWARE") return "HARDWARE"
    return "ASSET_REQUEST"
  }

  const text = `${ticket.title} ${ticket.summary}`.toLowerCase()
  if (text.includes("asset") || text.includes("request") || text.includes("laptop") || text.includes("monitor")) return "ASSET_REQUEST"
  if (text.includes("network") || text.includes("wifi") || text.includes("internet") || text.includes("vpn")) return "NETWORK"
  if (text.includes("hardware") || text.includes("printer") || text.includes("device") || text.includes("desktop")) return "HARDWARE"
  if (text.includes("software") || text.includes("application") || text.includes("install") || text.includes("license")) return "SOFTWARE"
  return "GENERAL"
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

export type { ITAsset, ITTicket, TicketCategory, TicketPriority, ITUser, TicketIssueType, TicketAssetIssue } from "./it-types"
export { getCurrentUser, isAnyITRole, isITAdmin, isITSupport, normalizeITRole, type ITAccessRole } from "./it-session"
