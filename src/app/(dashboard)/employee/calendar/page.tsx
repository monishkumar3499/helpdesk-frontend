"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch, toArrayResponse } from "@/lib/api"
import { TicketCalendar, type TicketCalendarItem } from "@/components/shared/ticket-calendar"

type EmployeeCalendarTicket = {
  id: string
  title: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
  priority: "LOW" | "HIGH" | "CRITICAL"
  createdAt: string
  createdBy?: { name: string }
}

export default function EmployeeCalendarPage() {
  const [tickets, setTickets] = useState<EmployeeCalendarTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch("/tickets/mine")
      .then((data) => setTickets(toArrayResponse<EmployeeCalendarTicket>(data)))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [])

  const items = useMemo<TicketCalendarItem[]>(
    () => tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title || "Untitled Ticket",
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      createdByName: ticket.createdBy?.name || "Unknown",
    })),
    [tickets],
  )

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Loading calendar...</p>
  }

  return (
    <TicketCalendar
      title="Calendar"
      subtitle="My ticket activity overview"
      tickets={items}
      emptyDayText="No tickets on this day"
      pageSize={5}
    />
  )
}
