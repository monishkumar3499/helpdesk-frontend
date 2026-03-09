"use client"

import { ITTicketBoard } from "../_components/it-ticket-board"
import { acceptTicket, manuallyAssign, rejectTicket } from "../_lib/it-ticket-actions"
import { useITTicketBoard } from "../_lib/use-it-ticket-board"

export default function ITResolvedPage() {
  const state = useITTicketBoard("resolved")
  if (state.loading) return <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />

  return (
    <ITTicketBoard
      title="Resolved Tickets"
      usingMock={state.usingMock}
      visibleTickets={state.visibleTickets}
      team={state.team}
      isAdmin={state.isAdmin}
      view="resolved"
      search={state.search}
      priority={state.priority}
      category={state.category}
      categories={state.categories}
      assignTo={state.assignTo}
      banner={state.banner}
      onSearch={state.setSearch}
      onPriority={state.setPriority}
      onCategory={state.setCategory}
      onAssignTo={(ticketId, memberId) => state.setAssignTo((prev) => ({ ...prev, [ticketId]: memberId }))}
      onAccept={(ticket) => acceptTicket(ticket, state.setTickets, state.setBanner)}
      onReject={(ticket) => rejectTicket(ticket, state.currentUserId, state.team, state.tickets, state.setTickets, state.setBanner)}
      onManualAssign={(ticket) => manuallyAssign(ticket, state.assignTo[ticket.id], state.setTickets, state.setBanner)}
    />
  )
}
