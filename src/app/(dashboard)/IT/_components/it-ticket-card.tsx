import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDeadlineLabel, inferTicketCategory, isOverdue, type ITTicket, type ITUser } from "../_lib/it-shared"
import { PRIORITY_COLORS, STATUS_COLORS } from "../_lib/it-ticket-board-shared"

type Props = {
  ticket: ITTicket
  team: ITUser[]
  isAdmin: boolean
  view: "all" | "assigned" | "accepted" | "resolved"
  selectedAssignee?: string
  onAssigneeChange: (value: string) => void
  onAccept: () => void
  onReject: () => void
  onManualAssign: () => void
}

export function ITTicketCard({ ticket, team, isAdmin, view, selectedAssignee, onAssigneeChange, onAccept, onReject, onManualAssign }: Props) {
  const category = inferTicketCategory(ticket)
  const assignedName = ticket.assignedTo?.name || team.find((m) => m.id === ticket.assignedToId)?.name || "Unassigned"

  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-800">{ticket.title}</p>
              <Badge className={STATUS_COLORS[ticket.status] || "bg-slate-100 text-slate-700"}>{ticket.status.replace("_", " ")}</Badge>
              <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
              <Badge variant="outline">{category.replace("_", " ")}</Badge>
              {isOverdue(ticket) && <Badge className="bg-red-100 text-red-700">SLA BREACH</Badge>}
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{ticket.summary}</p>
            <div className="text-xs text-slate-500 flex flex-wrap gap-3"><span>ID: {ticket.id}</span><span>Raised by: {ticket.createdBy?.name || "Unknown"}</span><span>Assigned: {assignedName}</span><span>Deadline: {getDeadlineLabel(ticket.priority)}</span></div>
          </div>
          <div className="flex items-center gap-2 flex-wrap lg:justify-end">
            {!isAdmin && view === "assigned" && ticket.status === "OPEN" && <><Button className="bg-amber-600 hover:bg-amber-700" onClick={onAccept}>Accept</Button><Button variant="outline" className="text-red-600 border-red-200" onClick={onReject}>Reject</Button></>}
            {isAdmin && ticket.status === "OPEN" && <><Select value={selectedAssignee || ""} onValueChange={onAssigneeChange}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Assign to member" /></SelectTrigger><SelectContent>{team.map((member) => <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>)}</SelectContent></Select><Button onClick={onManualAssign} disabled={!selectedAssignee}>Assign</Button></>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
