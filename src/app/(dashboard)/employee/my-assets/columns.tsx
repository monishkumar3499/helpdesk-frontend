"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Asset = {
  id: string
  serialNumber: string
  assetName: string
  assetType: "NETWORK" | "SOFTWARE" | "HARDWARE"
  assetStatus: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED"
  assignedDate?: string | null
  createdAt: string
}

const statusColor: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  RETIRED: "bg-red-100 text-red-800",
}

const typeColor: Record<string, string> = {
  NETWORK: "bg-purple-100 text-purple-800",
  SOFTWARE: "bg-blue-100 text-blue-800",
  HARDWARE: "bg-orange-100 text-orange-800",
}

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "assetName",
    header: () => <div className="text-center font-semibold">Name</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium min-w-[120px] py-3">
        {row.getValue("assetName")}
      </div>
    ),
  },
  {
    accessorKey: "serialNumber",
    header: () => <div className="text-center font-semibold">Serial Number</div>,
    cell: ({ row }) => (
      <div className="text-center min-w-[120px] py-3 text-slate-600">
        {row.getValue("serialNumber")}
      </div>
    ),
  },
  {
    accessorKey: "assetType",
    header: () => <div className="text-center font-semibold">Type</div>,
    cell: ({ row }) => {
      const type = row.getValue("assetType") as string
      return (
        <div className="text-center min-w-[120px] py-3">
          <Badge className={typeColor[type] || "bg-gray-100 text-gray-800"}>
            {type}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "assetStatus",
    header: () => <div className="text-center font-semibold">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("assetStatus") as string
      return (
        <div className="text-center min-w-[120px] py-3">
          <Badge className={statusColor[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200"}>
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "assignedDate",
    header: () => <div className="text-center font-semibold text-nowrap">Assigned On</div>,
    cell: ({ row }) => {
      const date = row.getValue("assignedDate") as string | undefined
      return (
        <div className="text-center min-w-[120px] py-3 text-slate-500 text-nowrap">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </div>
      )
    },
  },
]
