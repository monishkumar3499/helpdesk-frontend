"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"

// Updated Type to match actual API response
type Ticket = {
  id: string
  title: string
  summary: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  priority: "CRITICAL" | "HIGH" | "LOW"
  department: "HR" | "IT"
  createdAt: string
  createdBy?: {
    id: string
    name: string
    email: string
    role: string
  }
}

type SLAItem = {
  id: string
  issue: string
  priority: string
  status: "On Track" | "At Risk" | "Breached" | "Resolved"
  hoursLimit: number
  hoursElapsed: number
  ticketStatus: string
  createdBy: string
  createdAt: string
}

// SLA time limits based on priority
const SLA_LIMITS: Record<string, number> = {
  CRITICAL: 8,
  HIGH: 24,
  LOW: 48,
}

const statusConfig = {
  "On Track": { color: "bg-green-100 text-green-700 border-green-200", bar: "bg-green-500", dot: "bg-green-500" },
  "At Risk":  { color: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-500", dot: "bg-yellow-500" },
  "Breached": { color: "bg-red-100 text-red-700 border-red-200", bar: "bg-red-500", dot: "bg-red-500" },
  "Resolved": { color: "bg-blue-100 text-blue-700 border-blue-200", bar: "bg-blue-400", dot: "bg-blue-400" },
}

function getSLAStatus(hoursElapsed: number, hoursLimit: number, ticketStatus: string): "On Track" | "At Risk" | "Breached" | "Resolved" {
  if (ticketStatus === "RESOLVED") return "Resolved"
  if (hoursElapsed >= hoursLimit) return "Breached"
  if (hoursElapsed > hoursLimit * 0.75) return "At Risk"
  return "On Track"
}

function getHoursElapsed(createdAt: string, currentTime: number): number {
  const created = new Date(createdAt).getTime()
  const elapsedMs = currentTime - created
  // Prevent negative time
  const safeElapsed = Math.max(0, elapsedMs)
  return Math.round(safeElapsed / (1000 * 60 * 60))
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}h ${m}m ${s}s`
}

export default function SLAPage() {
  const [slaItems, setSlaItems] = useState<SLAItem[]>([])
  const [filter, setFilter] = useState<"All" | "On Track" | "At Risk" | "Breached" | "Resolved">("All")
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Live Timer Effect (Stopwatch updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    apiFetch("/tickets?department=HR")
      .then((response) => {
        // Handle API response structure - data is inside response.data
        const tickets: Ticket[] = response.data || []
        
        const items: SLAItem[] = tickets.map(t => {
          const hoursLimit = SLA_LIMITS[t.priority]
          const hoursElapsed = getHoursElapsed(t.createdAt, currentTime)
          const status = getSLAStatus(hoursElapsed, hoursLimit, t.status)
          return {
            id: t.id,
            issue: t.title,
            priority: t.priority,
            status,
            hoursLimit,
            hoursElapsed,
            ticketStatus: t.status,
            createdBy: t.createdBy?.name || "Unknown",
            createdAt: t.createdAt,
          }
        })
        setSlaItems(items)
        setUsingMock(false)
      })
      .catch((error) => {
        console.error("Failed to fetch tickets:", error)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }, [currentTime])

  const filtered = filter === "All" ? slaItems : slaItems.filter(s => s.status === filter)
  const onTrack = slaItems.filter(s => s.status === "On Track").length
  const atRisk = slaItems.filter(s => s.status === "At Risk").length
  const breached = slaItems.filter(s => s.status === "Breached").length
  const resolved = slaItems.filter(s => s.status === "Resolved").length

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Service Level Agreements</h2>
        <p className="text-sm text-slate-500 mt-1">
          {slaItems.length} tickets monitored · {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })}
          {usingMock && <span className="ml-2 text-orange-500">(Demo data — backend offline)</span>}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "On Track", count: onTrack, color: "border-l-green-500", textColor: "text-green-600", bg: "bg-green-100", emoji: "✅", key: "On Track" },
          { label: "At Risk",  count: atRisk,  color: "border-l-yellow-500", textColor: "text-yellow-600", bg: "bg-yellow-100", emoji: "⚠️", key: "At Risk" },
          { label: "Breached", count: breached, color: "border-l-red-500", textColor: "text-red-600", bg: "bg-red-100", emoji: "🚨", key: "Breached" },
          { label: "Resolved", count: resolved, color: "border-l-blue-500", textColor: "text-blue-600", bg: "bg-blue-100", emoji: "✔️", key: "Resolved" },
        ].map(s => (
          <Card key={s.label}
            className={`border-l-4 ${s.color} cursor-pointer hover:shadow-md transition-all ${filter === s.key ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
            onClick={() => setFilter(filter === s.key as any ? "All" : s.key as any)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className={`text-3xl font-bold ${s.textColor}`}>{s.count}</p>
              </div>
              <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center text-lg`}>
                {s.emoji}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter hint */}
      {filter !== "All" && (
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{filter}</span> ({filtered.length}) ·{" "}
          <button className="text-blue-600 underline" onClick={() => setFilter("All")}>Clear filter</button>
        </p>
      )}

      {/* SLA Items */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No tickets in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sla => {
            const percent = Math.min(Math.round((sla.hoursElapsed / sla.hoursLimit) * 100), 100)
            const config = statusConfig[sla.status]
            const created = new Date(sla.createdAt).getTime()
            const elapsedMs = currentTime - created
            const safeElapsedMs = Math.max(0, elapsedMs)

            return (
              <Card key={sla.id} className="border border-slate-200 hover:shadow-md transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${config.dot}`} />
                      <div>
                        <p className="font-semibold text-slate-800">{sla.issue}</p>
                        
                        {/* User Details Section */}
                        <p className="text-xs text-slate-500 mt-0.5">
                          Raised by <span className="font-medium text-slate-700">{sla.createdBy}</span> ·
                          Priority: <span className={`font-medium ${
                            sla.priority === "CRITICAL" ? "text-red-600" :
                            sla.priority === "HIGH" ? "text-orange-600" : "text-blue-600"
                          }`}>{sla.priority}</span> ·
                          Ticket: <span className="font-medium">{sla.ticketStatus.replace("_", " ")}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${config.color}`}>
                      {sla.status}
                    </span>
                  </div>

                  {/* Stopwatch Timer */}
                  <div className="mt-3 flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-xs font-mono text-slate-500">⏱️</span>
                    <span className="text-sm font-mono font-semibold text-slate-700">
                      {formatTime(safeElapsedMs)}
                    </span>
                    <span className="text-xs text-slate-400">/</span>
                    <span className="text-xs font-medium text-slate-500">
                      {sla.hoursLimit}h Limit
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Elapsed: <span className="font-medium text-slate-700">{sla.hoursElapsed} hrs</span></span>
                      <span>SLA Limit: <span className="font-medium text-slate-700">{sla.hoursLimit} hrs</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${config.bar}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-slate-400">0 hrs</span>
                      <span className={`font-semibold ${
                        sla.status === "Breached" ? "text-red-600" :
                        sla.status === "At Risk" ? "text-yellow-600" :
                        sla.status === "Resolved" ? "text-blue-600" : "text-green-600"
                      }`}>{percent}% of SLA used</span>
                      <span className="text-slate-400">{sla.hoursLimit} hrs</span>
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