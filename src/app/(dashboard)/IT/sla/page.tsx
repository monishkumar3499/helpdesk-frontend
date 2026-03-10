"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { TicketSLA, type TicketSlaItem } from "@/components/shared/ticket-sla"
import { getCurrentUser, isITAdmin, normalizeTicket, toArrayResponse, type ITTicket } from "../_lib/it-shared"

export default function ITSlaPage() {
  const currentUser = getCurrentUser()
  const [tickets, setTickets] = useState<ITTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch("/tickets?department=IT", undefined, { forceBackend: true })
      .then((data) => {
        const normalized = toArrayResponse<unknown>(data).map(normalizeTicket)
        const scoped = isITAdmin(currentUser?.role)
          ? normalized
          : normalized.filter((ticket) => {
            if (currentUser?.id && ticket.assignedToId === currentUser.id) return true
            return !!currentUser?.email && ticket.assignedTo?.email === currentUser.email
          })
        setTickets(scoped)
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [currentUser?.email, currentUser?.id, currentUser?.role])

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
      subtitle={`${items.length} IT tickets monitored`}
      tickets={items}
      loading={loading}
    />
  )
}
