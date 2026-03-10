"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Ticket = {
  id: string
  title: string
  summary: string
  imageUrl?: string | null
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  priority: "CRITICAL" | "HIGH" | "LOW"
  department: "HR" | "IT"
  issueType?: "GENERAL" | "ASSET_REQUEST" | "ASSET_PROBLEM"
  assetIssue?: {
    assetSerialNumber?: string | null
    assetCategory?: string | null
    assetClassification?: "NETWORK" | "SOFTWARE" | "HARDWARE" | null
    requestedAssetName?: string | null
  } | null
  createdAt: string
  createdBy?: { name: string }
  assignedToId?: string | null
}

const statusColor: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
}

const priorityColor: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  LOW: "bg-gray-100 text-gray-800",
}

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "id",
    header: "Ticket ID",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    id: "issueType",
    header: "Issue Type",
    cell: ({ row }) => {
      const ticket = row.original
      if (ticket.department !== "IT") return "-"
      return (ticket.issueType || "GENERAL").replaceAll("_", " ")
    },
  },
  {
    id: "assetIssue",
    header: "Asset Info",
    cell: ({ row }) => {
      const ticket = row.original
      if (ticket.department !== "IT" || !ticket.assetIssue) return "-"

      const issue = ticket.assetIssue
      if (ticket.issueType === "ASSET_PROBLEM") {
        return issue.assetSerialNumber || issue.requestedAssetName || "-"
      }

      return issue.requestedAssetName || issue.assetCategory || "-"
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge className={statusColor[status]}>
          {status.replace("_", " ")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string
      return (
        <Badge className={priorityColor[priority]}>
          {priority}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      return new Date(date).toLocaleDateString()
    },
  },
]