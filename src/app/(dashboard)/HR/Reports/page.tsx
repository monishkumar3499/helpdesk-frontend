"use client"

import { useEffect, useMemo, useState } from "react"
import { getHrTicketsForCurrentUser } from "@/lib/hrTickets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type HRTicket = {
  id: string
  title: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
  priority: "LOW" | "HIGH" | "CRITICAL"
  createdBy?: { name?: string }
}

export default function HRReportsPage() {
  const [tickets, setTickets] = useState<HRTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getHrTicketsForCurrentUser<HRTicket>()
        setTickets(data)
      } catch (error) {
        console.error("Failed to load HR reports", error)
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "OPEN").length
    const inProgress = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length
    const resolved = tickets.filter((ticket) => ticket.status === "RESOLVED").length
    const rejected = tickets.filter((ticket) => ticket.status === "REJECTED").length
    const critical = tickets.filter((ticket) => ticket.priority === "CRITICAL").length

    return { open, inProgress, resolved, rejected, critical }
  }, [tickets])

  if (loading) {
    return <p className="text-sm text-slate-500">Loading reports...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">HR Reports</h2>
        <p className="text-sm text-slate-500">Ticket summary for the HR department</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard label="Total" value={tickets.length} />
        <SummaryCard label="Open" value={stats.open} />
        <SummaryCard label="In Progress" value={stats.inProgress} />
        <SummaryCard label="Resolved" value={stats.resolved} />
        <SummaryCard label="Rejected" value={stats.rejected} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest HR Tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tickets.slice(0, 8).map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{ticket.title}</p>
                <p className="text-xs text-slate-500">{ticket.createdBy?.name || "Unknown"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-700">{ticket.status.replace("_", " ")}</p>
                <p className="text-xs text-slate-500">{ticket.priority}</p>
              </div>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-sm text-slate-500">No HR tickets available.</p>}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">Critical tickets: {stats.critical}</p>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </CardContent>
    </Card>
  )
}
