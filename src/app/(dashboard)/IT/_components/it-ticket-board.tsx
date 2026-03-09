"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { type ITTicket, type ITUser } from "../_lib/it-shared"
import { PRIORITY_COLORS, STATUS_COLORS } from "../_lib/it-ticket-board-shared"
import { ITTicketCard } from "./it-ticket-card"
import { ITTicketFilters } from "./it-ticket-filters"

type Props = {
  title: string
  usingMock: boolean
  visibleTickets: ITTicket[]
  team: ITUser[]
  isAdmin: boolean
  status: string
  search: string
  priority: string
  category: string
  categories: string[]
  assignTo: Record<string, string>
  banner: string
  onSearch: (text: string) => void
  onPriority: (value: string) => void
  onCategory: (value: string) => void
  onStatus: (value: string) => void
  onAssignTo: (ticketId: string, memberId: string) => void
  onAccept: (ticket: ITTicket) => void
  onReject: (ticket: ITTicket) => void
  onManualAssign: (ticket: ITTicket) => void
}

export function ITTicketBoard(props: Props) {
  const [selectedTicket, setSelectedTicket] = useState<ITTicket | null>(null)

  const filteredByStatus = useMemo(() => {
    if (props.status === "ALL") return props.visibleTickets
    return props.visibleTickets.filter((ticket) => ticket.status === props.status)
  }, [props.visibleTickets, props.status])

  const selectedAssigneeName = selectedTicket
    ? selectedTicket.assignedTo?.name || props.team.find((member) => member.id === selectedTicket.assignedToId)?.name || "Unassigned"
    : ""

  const selectedAvatar = selectedTicket?.createdBy?.name
    ? selectedTicket.createdBy.name.split(" ").map((part) => part[0]).join("")
    : "IT"

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{props.title}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {filteredByStatus.length} visible tickets
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
          status={props.status}
        priority={props.priority}
        category={props.category}
        categories={props.categories}
        isAdmin={props.isAdmin}
        onSearch={props.onSearch}
          onStatus={props.onStatus}
        onPriority={props.onPriority}
        onCategory={props.onCategory}
      />

      <div className="space-y-3">
        {filteredByStatus.length === 0 && (
          <Card><CardContent className="py-10 text-center text-slate-500">No tickets match this view.</CardContent></Card>
        )}
        {filteredByStatus.map((ticket) => (
          <ITTicketCard
            key={ticket.id}
            ticket={ticket}
            team={props.team}
            isAdmin={props.isAdmin}
            onOpenDetails={() => setSelectedTicket(ticket)}
            selectedAssignee={props.assignTo[ticket.id]}
            onAssigneeChange={(value) => props.onAssignTo(ticket.id, value)}
            onAccept={() => props.onAccept(ticket)}
            onReject={() => props.onReject(ticket)}
            onManualAssign={() => props.onManualAssign(ticket)}
          />
        ))}
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        {selectedTicket && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-slate-800 text-white font-bold">{selectedAvatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-800">{selectedTicket.createdBy?.name || "Unknown Employee"}</p>
                  <p className="text-sm text-slate-500">Ticket ID: {selectedTicket.id}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Title</span>
                  <span className="font-medium text-right">{selectedTicket.title}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedTicket.status] || "bg-slate-100 text-slate-700"}`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Priority</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Assigned To</span>
                  <span className="font-medium text-right">{selectedAssigneeName}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Summary</p>
                <p className="text-sm text-slate-800">{selectedTicket.summary || "No details provided."}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
