import { DataTable } from "@/components/ui/data-table"
import { columns, Ticket } from "./columns"

const data: Ticket[] = [
  {
    id: "TCK-001",
    title: "Login not working",
    summary: "User unable to login",
    imageUrl: null,
    status: "OPEN",
    priority: "HIGH",
    department: "IT",
    createdAt: "2026-02-18T00:00:00.000Z",
    assignedToId: null,
  },
  {
    id: "TCK-002",
    title: "Payroll issue",
    summary: "Salary mismatch",
    imageUrl: null,
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    department: "HR",
    createdAt: "2026-02-15T00:00:00.000Z",
    assignedToId: null,
  },
]

export default function MyTicketsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}