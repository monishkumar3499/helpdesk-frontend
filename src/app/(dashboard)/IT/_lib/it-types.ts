export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED"
export type TicketPriority = "CRITICAL" | "HIGH" | "LOW"
export type TicketCategory = "SOFTWARE" | "HARDWARE" | "NETWORK" | "ASSET_REQUEST" | "GENERAL"

export type ITTicket = {
  id: string
  title: string
  summary: string
  department: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  createdById?: string
  assignedToId?: string | null
  createdBy?: { id: string; name: string; email: string; role: string }
  assignedTo?: { id: string; name: string; email: string; role: string } | null
}

export type ITUser = {
  id: string
  name: string
  email: string
  role: string
  isActive?: boolean
}

export type ITAsset = {
  id: string
  serialNumber: string
  assetName: string
  assetType: "SOFTWARE" | "HARDWARE" | "NETWORK"
  assetStatus: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED"
  assignedToId?: string | null
  createdAt: string
  assignedTo?: { id: string; name: string; email: string } | null
}
