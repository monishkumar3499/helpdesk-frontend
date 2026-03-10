"use client"

import { useEffect, useMemo, useState } from "react"
import { TicketSLA, type TicketSlaItem } from "@/components/shared/ticket-sla"
import { getHrTicketsForCurrentUser } from "@/lib/hrTickets"

type HrSlaTicket = {
  id: string
  title: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
  priority: "CRITICAL" | "HIGH" | "LOW"
  createdAt: string
  createdBy?: { name: string }
}

export default function SLAPage() {
  const [tickets, setTickets] = useState<HrSlaTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHrTicketsForCurrentUser<HrSlaTicket>()
      .then((data) => setTickets(data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [])

  const items = useMemo<TicketSlaItem[]>(
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

  return (
    <TicketSLA
      title="Service Level Agreements"
      subtitle={`${items.length} tickets monitored`}
      tickets={items}
      loading={loading}
    />
  )
}
