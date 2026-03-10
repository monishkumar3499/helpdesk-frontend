"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { TicketCalendar, type TicketCalendarItem } from "@/components/shared/ticket-calendar"
import { getCurrentUser, isITAdmin, normalizeTicket, toArrayResponse, type ITTicket } from "../_lib/it-shared"

export default function ITCalendarPage() {
  const currentUser = getCurrentUser()
  const [tickets, setTickets] = useState<ITTicket[]>([])

  useEffect(() => {
    apiFetch("/tickets?department=IT", undefined, { forceBackend: true })
      .then((data) => {
        const normalized = toArrayResponse<unknown>(data).map(normalizeTicket)
        if (isITAdmin(currentUser?.role)) {
          setTickets(normalized)
          return
        }
        const filtered = normalized.filter((ticket) => {
          if (currentUser?.id && ticket.assignedToId === currentUser.id) return true
          return !!currentUser?.email && ticket.assignedTo?.email === currentUser.email
        })
        setTickets(filtered)
      })
      .catch(() => setTickets([]))
  }, [currentUser?.email, currentUser?.id, currentUser?.role])

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

  return (
    <TicketCalendar
      title="Calendar"
      subtitle="IT ticket activity overview"
      tickets={items}
      emptyDayText="No IT tickets on this day"
    />
  )
}
