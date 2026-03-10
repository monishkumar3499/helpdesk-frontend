"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, isITAdmin, normalizeTicket, toArrayResponse, type ITTicket, type ITUser } from "../_lib/it-shared"
import { CircleCheckBig, Ticket, Timer, UsersRound, Wrench } from "lucide-react"

type SupportStats = {
  id: string
  name: string
  email: string
  open: number
  inProgress: number
  resolved: number
  totalAssigned: number
  criticalOpen: number
  avgAgeHours: number
  recentTickets: ITTicket[]
}

function getAgeHours(createdAt: string) {
  return Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)))
}

export default function ITSupportPage() {
  const currentUser = getCurrentUser()
  const [team, setTeam] = useState<ITUser[]>([])
  const [tickets, setTickets] = useState<ITTicket[]>([])
  const [loading, setLoading] = useState(true)

  const adminView = isITAdmin(currentUser?.role)

  useEffect(() => {
    if (!adminView) {
      setLoading(false)
      return
    }

    Promise.all([
      apiFetch("/users?role=IT_SUPPORT", undefined, { forceBackend: true }),
      apiFetch("/tickets?department=IT", undefined, { forceBackend: true }),
    ])
      .then(([users, ticketData]) => {
        setTeam(toArrayResponse<ITUser>(users).filter((member) => member.isActive !== false))
        setTickets(toArrayResponse<unknown>(ticketData).map(normalizeTicket))
      })
      .catch(() => {
        setTeam([])
        setTickets([])
      })
      .finally(() => setLoading(false))
  }, [adminView])

  const supportStats = useMemo<SupportStats[]>(() => {
    return team
      .map((member) => {
        const assigned = tickets.filter((ticket) => ticket.assignedToId === member.id)
        const open = assigned.filter((ticket) => ticket.status === "OPEN")
        const inProgress = assigned.filter((ticket) => ticket.status === "IN_PROGRESS")
        const resolved = assigned.filter((ticket) => ticket.status === "RESOLVED")
        const avgAgeHours = assigned.length === 0
          ? 0
          : Math.round(assigned.reduce((sum, ticket) => sum + getAgeHours(ticket.createdAt), 0) / assigned.length)

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          open: open.length,
          inProgress: inProgress.length,
          resolved: resolved.length,
          totalAssigned: assigned.length,
          criticalOpen: open.filter((ticket) => ticket.priority === "CRITICAL").length,
          avgAgeHours,
          recentTickets: assigned.slice(0, 3),
        }
      })
      .sort((a, b) => (b.open + b.inProgress) - (a.open + a.inProgress))
  }, [team, tickets])

  const totals = useMemo(() => {
    return {
      members: supportStats.length,
      open: supportStats.reduce((sum, member) => sum + member.open, 0),
      inProgress: supportStats.reduce((sum, member) => sum + member.inProgress, 0),
      resolved: supportStats.reduce((sum, member) => sum + member.resolved, 0),
    }
  }, [supportStats])

  if (!adminView) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-slate-600">Only IT admin can access IT support analytics.</CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => <div key={index} className="h-28 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="it-page-stack">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Members", value: totals.members, color: "border-l-cyan-500", icon: UsersRound, iconColor: "text-cyan-500" },
          { label: "Open", value: totals.open, color: "border-l-blue-500", icon: Ticket, iconColor: "text-blue-500" },
          { label: "In Progress", value: totals.inProgress, color: "border-l-amber-500", icon: Timer, iconColor: "text-amber-500" },
          { label: "Resolved", value: totals.resolved, color: "border-l-green-500", icon: CircleCheckBig, iconColor: "text-green-500" },
        ].map((item) => (
          <Card key={item.label} className={`border-l-4 ${item.color} it-hover-card overflow-hidden`}>
            <CardHeader className="pb-0.5 pt-2.5 px-3">
              <CardTitle className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between gap-1">
                <span className="truncate">{item.label}</span>
                <item.icon className={`h-3 w-3 shrink-0 ${item.iconColor}`} />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              <p className="text-xl font-bold text-slate-800 leading-none">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {supportStats.map((member) => (
          <Card key={member.id} className="it-hover-card border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{member.name}</span>
                <Badge className="it-pill bg-slate-100 text-slate-700">{member.totalAssigned} assigned</Badge>
              </CardTitle>
              <p className="text-xs text-slate-500">{member.email}</p>
            </CardHeader>
            <CardContent className="it-card-pad space-y-3 pt-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-blue-50 p-2"><p className="text-xs text-blue-700">Open</p><p className="font-semibold text-blue-800">{member.open}</p></div>
                <div className="rounded-md bg-amber-50 p-2"><p className="text-xs text-amber-700">In Progress</p><p className="font-semibold text-amber-800">{member.inProgress}</p></div>
                <div className="rounded-md bg-green-50 p-2"><p className="text-xs text-green-700">Resolved</p><p className="font-semibold text-green-800">{member.resolved}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-red-700">Critical Open: <span className="font-semibold">{member.criticalOpen}</span></div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-700">Avg Ticket Age: <span className="font-semibold">{member.avgAgeHours}h</span></div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Recent Assigned Tickets</p>
                <div className="space-y-1.5">
                  {member.recentTickets.length === 0 && <p className="text-xs text-slate-400">No assigned tickets.</p>}
                  {member.recentTickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs">
                      <p className="font-medium text-slate-700">{ticket.title}</p>
                      <p className="text-slate-500">{ticket.id} • {ticket.status.replace("_", " ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
