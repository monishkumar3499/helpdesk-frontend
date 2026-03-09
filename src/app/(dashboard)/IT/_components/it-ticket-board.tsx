"use client"

import { Card, CardContent } from "@/components/ui/card"
import { type ITTicket, type ITUser } from "../_lib/it-shared"
import { ITTicketCard } from "./it-ticket-card"
import { ITTicketFilters } from "./it-ticket-filters"

type Props = {
  title: string
  usingMock: boolean
  visibleTickets: ITTicket[]
  team: ITUser[]
  isAdmin: boolean
  view: "all" | "assigned" | "accepted" | "resolved"
  search: string
  priority: string
  category: string
  categories: string[]
  assignTo: Record<string, string>
  banner: string
  onSearch: (text: string) => void
  onPriority: (value: string) => void
  onCategory: (value: string) => void
  onAssignTo: (ticketId: string, memberId: string) => void
  onAccept: (ticket: ITTicket) => void
  onReject: (ticket: ITTicket) => void
  onManualAssign: (ticket: ITTicket) => void
}

export function ITTicketBoard(props: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{props.title}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {props.visibleTickets.length} visible tickets
          {props.usingMock && <span className="ml-2 text-orange-500">(Demo mode)</span>}
        </p>
      </div>

      {props.banner && (
        <Card className="border border-sky-200 bg-sky-50">
          <CardContent className="py-3 text-sm text-sky-800">{props.banner}</CardContent>
        </Card>
      )}

      <ITTicketFilters
        search={props.search}
        priority={props.priority}
        category={props.category}
        categories={props.categories}
        isAdmin={props.isAdmin}
        onSearch={props.onSearch}
        onPriority={props.onPriority}
        onCategory={props.onCategory}
      />

      <div className="space-y-3">
        {props.visibleTickets.length === 0 && (
          <Card><CardContent className="py-10 text-center text-slate-500">No tickets match this view.</CardContent></Card>
        )}
        {props.visibleTickets.map((ticket) => (
          <ITTicketCard
            key={ticket.id}
            ticket={ticket}
            team={props.team}
            isAdmin={props.isAdmin}
            view={props.view}
            selectedAssignee={props.assignTo[ticket.id]}
            onAssigneeChange={(value) => props.onAssignTo(ticket.id, value)}
            onAccept={() => props.onAccept(ticket)}
            onReject={() => props.onReject(ticket)}
            onManualAssign={() => props.onManualAssign(ticket)}
          />
        ))}
      </div>
    </div>
  )
}
