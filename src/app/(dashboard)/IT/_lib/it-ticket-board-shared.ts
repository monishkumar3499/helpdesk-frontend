import { type ITUser } from "./it-types"

export type BoardView = "assigned" | "accepted" | "resolved" | "all"

export const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
}

export const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
}

export const REJECTION_MAP_KEY = "it_ticket_rejections"
export const ADMIN_ALERTS_KEY = "it_admin_alerts"

export const MOCK_IT_TEAM: ITUser[] = [
  { id: "it-1", name: "Asha IT", email: "asha.it@company.com", role: "IT_SUPPORT", isActive: true },
  { id: "it-2", name: "Ravi IT", email: "ravi.it@company.com", role: "IT_SUPPORT", isActive: true },
  { id: "it-3", name: "Meena IT", email: "meena.it@company.com", role: "IT_SUPPORT", isActive: true },
  { id: "it-4", name: "Sanjay IT", email: "sanjay.it@company.com", role: "IT_SUPPORT", isActive: true },
  { id: "it-5", name: "Kiran IT", email: "kiran.it@company.com", role: "IT_SUPPORT", isActive: true },
]

export const TITLE_MAP: Record<BoardView, string> = {
  all: "All IT Tickets",
  assigned: "Assigned Tickets",
  accepted: "Accepted Tickets",
  resolved: "Resolved Tickets",
}
