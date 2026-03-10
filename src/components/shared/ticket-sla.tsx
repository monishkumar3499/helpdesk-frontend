"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export type TicketSlaItem = {
  id: string
  title: string
  priority: "CRITICAL" | "HIGH" | "LOW"
  status: string
  createdAt: string
  createdByName: string
}

type SLAStatus = "On Track" | "At Risk" | "Breached" | "Resolved"

type Props = {
  title: string
  subtitle: string
  tickets: TicketSlaItem[]
  loading?: boolean
}

type SLAViewItem = {
  id: string
  issue: string
  priority: TicketSlaItem["priority"]
  ticketStatus: string
  status: SLAStatus
  hoursLimit: number
  hoursElapsed: number
  elapsedMs: number
  createdBy: string
}

const SLA_LIMITS: Record<TicketSlaItem["priority"], number> = {
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

function elapsedHours(createdAt: string, now: number): number {
  const created = new Date(createdAt).getTime()
  return Math.max(0, Math.round((now - created) / (1000 * 60 * 60)))
}

function elapsedMilliseconds(createdAt: string, now: number): number {
  const created = new Date(createdAt).getTime()
  return Math.max(0, now - created)
}

function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}h ${m}m ${s}s`
}

function isClosedStatus(status: string): boolean {
  return status === "RESOLVED" || status === "REJECTED" || status === "CLOSED"
}

function resolveSLAStatus(hoursElapsed: number, hoursLimit: number, ticketStatus: string): SLAStatus {
  if (isClosedStatus(ticketStatus)) return "Resolved"
  if (hoursElapsed > hoursLimit) return "Breached"
  if (hoursElapsed > hoursLimit * 0.75) return "At Risk"
  return "On Track"
}

export function TicketSLA({ title, subtitle, tickets, loading = false }: Props) {
  const [filter, setFilter] = useState<"All" | SLAStatus>("All")
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const items = useMemo<SLAViewItem[]>(() => {
    return tickets.map((ticket) => {
      const hoursLimit = SLA_LIMITS[ticket.priority]
      const hoursElapsed = elapsedHours(ticket.createdAt, currentTime)
      const elapsedMs = elapsedMilliseconds(ticket.createdAt, currentTime)
      return {
        id: ticket.id,
        issue: ticket.title,
        priority: ticket.priority,
        ticketStatus: ticket.status,
        status: resolveSLAStatus(hoursElapsed, hoursLimit, ticket.status),
        hoursLimit,
        hoursElapsed,
        elapsedMs,
        createdBy: ticket.createdByName,
      }
    })
  }, [tickets, currentTime])

  const filtered = useMemo(
    () => (filter === "All" ? items : items.filter((item) => item.status === filter)),
    [items, filter],
  )

  const counters = {
    onTrack: items.filter((item) => item.status === "On Track").length,
    atRisk: items.filter((item) => item.status === "At Risk").length,
    breached: items.filter((item) => item.status === "Breached").length,
    resolved: items.filter((item) => item.status === "Resolved").length,
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "On Track", value: counters.onTrack, border: "border-l-green-500", text: "text-green-600" },
          { label: "At Risk", value: counters.atRisk, border: "border-l-yellow-500", text: "text-yellow-600" },
          { label: "Breached", value: counters.breached, border: "border-l-red-500", text: "text-red-600" },
          { label: "Resolved", value: counters.resolved, border: "border-l-blue-500", text: "text-blue-600" },
        ].map((card) => (
          <Card
            key={card.label}
            className={`border-l-4 ${card.border} cursor-pointer hover:shadow-md transition-all ${filter === card.label ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
            onClick={() => setFilter(filter === card.label ? "All" : (card.label as SLAStatus))}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filter !== "All" && (
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{filter}</span> ({filtered.length})
          <button className="ml-2 text-blue-600 underline" onClick={() => setFilter("All")}>Clear filter</button>
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No tickets in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const config = STATUS_STYLE[item.status]
            const percent = Math.min(Math.round((item.hoursElapsed / item.hoursLimit) * 100), 100)
            return (
              <Card key={item.id} className="border border-slate-200 hover:shadow-md transition-all duration-200">
                <CardContent className="p-5">
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
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${config.color}`}>{item.status}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-xs font-mono text-slate-500">Timer</span>
                    <span className="text-sm font-mono font-semibold text-slate-700">{formatTimer(item.elapsedMs)}</span>
                    <span className="text-xs text-slate-400">/</span>
                    <span className="text-xs font-medium text-slate-500">{item.hoursLimit}h Limit</span>
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
      )}
    </div>
  )
}
