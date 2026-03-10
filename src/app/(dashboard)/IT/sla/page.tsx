"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser, isITAdmin, normalizeTicket, toArrayResponse, type ITTicket } from "../_lib/it-shared"
import { ShieldAlert, Sparkles } from "lucide-react"

type SLAStatus = "On Track" | "At Risk" | "Breached" | "Resolved"

type SLAItem = {
  id: string
  issue: string
  priority: ITTicket["priority"]
  ticketStatus: ITTicket["status"]
  status: SLAStatus
  hoursLimit: number
  hoursElapsed: number
  createdBy: string
}

const SLA_LIMITS: Record<ITTicket["priority"], number> = {
  CRITICAL: 8,
  HIGH: 24,
  LOW: 48,
}

const STATUS_STYLE: Record<SLAStatus, { color: string; bar: string; dot: string }> = {
  "On Track": { color: "bg-green-100 text-green-700 border-green-200", bar: "bg-green-500", dot: "bg-green-500" },
  "At Risk": { color: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-500", dot: "bg-yellow-500" },
  "Breached": { color: "bg-red-100 text-red-700 border-red-200", bar: "bg-red-500", dot: "bg-red-500" },
  "Resolved": { color: "bg-blue-100 text-blue-700 border-blue-200", bar: "bg-blue-400", dot: "bg-blue-400" },
}

function elapsedHours(createdAt: string) {
  const created = new Date(createdAt).getTime()
  return Math.max(0, Math.round((Date.now() - created) / (1000 * 60 * 60)))
}

function getSLAStatus(hoursElapsed: number, hoursLimit: number, ticketStatus: ITTicket["status"]): SLAStatus {
  if (ticketStatus === "RESOLVED") return "Resolved"
  if (hoursElapsed > hoursLimit) return "Breached"
  if (hoursElapsed > hoursLimit * 0.75) return "At Risk"
  return "On Track"
}

export default function ITSlaPage() {
  const currentUser = getCurrentUser()
  const [items, setItems] = useState<SLAItem[]>([])
  const [filter, setFilter] = useState<"All" | SLAStatus>("All")

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

        const mapped = scoped.map((ticket) => {
          const hoursLimit = SLA_LIMITS[ticket.priority]
          const hoursElapsed = elapsedHours(ticket.createdAt)
          return {
            id: ticket.id,
            issue: ticket.title,
            priority: ticket.priority,
            ticketStatus: ticket.status,
            status: getSLAStatus(hoursElapsed, hoursLimit, ticket.status),
            hoursLimit,
            hoursElapsed,
            createdBy: ticket.createdBy?.name || "Unknown",
          } as SLAItem
        })
        setItems(mapped)
      })
      .catch(() => setItems([]))
  }, [currentUser?.email, currentUser?.id, currentUser?.role])

  const filtered = useMemo(() => filter === "All" ? items : items.filter((item) => item.status === filter), [items, filter])

  const counters = {
    onTrack: items.filter((item) => item.status === "On Track").length,
    atRisk: items.filter((item) => item.status === "At Risk").length,
    breached: items.filter((item) => item.status === "Breached").length,
    resolved: items.filter((item) => item.status === "Resolved").length,
  }

  return (
    <div className="it-page-stack">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-rose-50 via-white to-orange-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-200/40 blur-2xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h2 className="it-hero-title text-slate-800">Service Level Agreements</h2>
            <p className="it-hero-subtitle text-slate-500">
              {items.length} IT tickets monitored · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-sm">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            SLA Tracking
            <Sparkles className="h-4 w-4 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "On Track", value: counters.onTrack, border: "border-l-green-500", text: "text-green-600", icon: "✅" as const },
          { label: "At Risk", value: counters.atRisk, border: "border-l-yellow-500", text: "text-yellow-600", icon: "⚠️" as const },
          { label: "Breached", value: counters.breached, border: "border-l-red-500", text: "text-red-600", icon: "🚨" as const },
          { label: "Resolved", value: counters.resolved, border: "border-l-blue-500", text: "text-blue-600", icon: "✔️" as const },
        ].map((card) => (
          <Card
            key={card.label}
            className={`border-l-4 ${card.border} cursor-pointer it-hover-card ${filter === card.label ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
            onClick={() => setFilter(filter === card.label ? "All" : (card.label as SLAStatus))}
          >
            <CardContent className="it-card-pad-sm flex items-center justify-between">
              <div>
                <p className="it-kpi-label text-sm">{card.label}</p>
                <p className={`it-kpi-value ${card.text}`}>{card.value}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">{card.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const config = STATUS_STYLE[item.status]
          const percent = Math.min(Math.round((item.hoursElapsed / item.hoursLimit) * 100), 100)
          return (
            <Card key={item.id} className="border border-slate-200 it-hover-card">
              <CardContent className="it-card-pad">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${config.dot}`} />
                    <div>
                      <p className="font-semibold text-slate-800">{item.issue}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Raised by <span className="font-medium">{item.createdBy}</span> · Priority: <span className="font-medium">{item.priority}</span> · Ticket: <span className="font-medium">{item.ticketStatus.replace("_", " ")}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`it-pill border shrink-0 ${config.color}`}>{item.status}</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Elapsed: <span className="font-medium text-slate-700">{item.hoursElapsed} hrs</span></span>
                    <span>SLA Limit: <span className="font-medium text-slate-700">{item.hoursLimit} hrs</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all duration-700 ${config.bar}`} style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-400">0 hrs</span>
                    <span className="font-semibold">{percent}% of SLA used</span>
                    <span className="text-slate-400">{item.hoursLimit} hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
