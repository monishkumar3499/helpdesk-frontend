"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertTriangle, BarChart3, CheckCircle2, PieChart, Sparkles, TrendingUp } from "lucide-react"
import { getCurrentUser, inferTicketCategory, isITAdmin, normalizeTicket, toArrayResponse, type ITTicket } from "../_lib/it-shared"

function HorizontalBars({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-28 shrink-0">{item.label}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
            <div className={`h-full rounded-full ${item.color} flex items-center justify-end pr-2 transition-all duration-700`} style={{ width: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%` }}>
              <span className="text-[10px] text-white font-bold">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ITReportsPage() {
  const currentUser = getCurrentUser()
  const [tickets, setTickets] = useState<ITTicket[]>([])

  useEffect(() => {
    apiFetch("/tickets?department=IT")
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

  const open = tickets.filter((ticket) => ticket.status === "OPEN").length
  const inProgress = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length
  const resolved = tickets.filter((ticket) => ticket.status === "RESOLVED").length
  const resolutionRate = tickets.length > 0 ? Math.round((resolved / tickets.length) * 100) : 0

  const categoryBuckets = useMemo(() => {
    const bucket: Record<string, number> = {}
    tickets.forEach((ticket) => {
      const category = inferTicketCategory(ticket)
      bucket[category] = (bucket[category] || 0) + 1
    })
    return bucket
  }, [tickets])

  const statusData = [
    { label: "Open", value: open, color: "bg-blue-500" },
    { label: "In Progress", value: inProgress, color: "bg-amber-500" },
    { label: "Resolved", value: resolved, color: "bg-green-500" },
  ]

  const priorityData = [
    { label: "Critical", value: tickets.filter((ticket) => ticket.priority === "CRITICAL").length, color: "bg-red-500" },
    { label: "High", value: tickets.filter((ticket) => ticket.priority === "HIGH").length, color: "bg-orange-500" },
    { label: "Low", value: tickets.filter((ticket) => ticket.priority === "LOW").length, color: "bg-blue-400" },
  ]

  const maxStatus = Math.max(...statusData.map((item) => item.value), 1)
  const maxPriority = Math.max(...priorityData.map((item) => item.value), 1)

  const categoryEntries = Object.entries(categoryBuckets)
  const totalCategories = categoryEntries.reduce((sum, [, count]) => sum + count, 0)
  const categorySegments = categoryEntries.map(([name, count], index) => {
    const colors = ["#2563eb", "#f59e0b", "#ef4444", "#10b981", "#64748b"]
    return { name, count, color: colors[index % colors.length] }
  })

  let start = 0
  const conicParts = categorySegments.map((segment) => {
    const percentage = totalCategories > 0 ? (segment.count / totalCategories) * 100 : 0
    const next = start + percentage
    const part = `${segment.color} ${start}% ${next}%`
    start = next
    return part
  })

  return (
    <div className="it-page-stack">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-indigo-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-200/40 blur-2xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h2 className="it-hero-title text-slate-800">IT Reports & Analytics</h2>
            <p className="it-hero-subtitle text-slate-500">Live insights from IT tickets and category trends</p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-sm">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            Insight Stream
            <Sparkles className="h-4 w-4 text-sky-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tickets", value: tickets.length, color: "border-l-blue-500", textColor: "text-slate-800", icon: <BarChart3 className="h-8 w-8 text-blue-400" /> },
          { label: "Resolution Rate", value: `${resolutionRate}%`, color: "border-l-green-500", textColor: "text-green-600", icon: <CheckCircle2 className="h-8 w-8 text-green-400" /> },
          { label: "Critical", value: priorityData[0].value, color: "border-l-red-500", textColor: "text-red-600", icon: <AlertTriangle className="h-8 w-8 text-red-400" /> },
          { label: "In Progress", value: inProgress, color: "border-l-amber-500", textColor: "text-amber-600", icon: <Activity className="h-8 w-8 text-amber-400" /> },
        ].map((kpi) => (
          <Card key={kpi.label} className={`border-l-4 ${kpi.color} it-hover-card`}>
            <CardContent className="it-card-pad-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="it-kpi-label font-medium">{kpi.label}</p>
                  <p className={`it-kpi-value mt-1 ${kpi.textColor}`}>{kpi.value}</p>
                </div>
                {kpi.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="it-hover-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-slate-500" />Tickets by Status (Bar)</CardTitle>
          </CardHeader>
          <CardContent className="it-card-pad pt-0">
            <HorizontalBars data={statusData} maxVal={maxStatus} />
          </CardContent>
        </Card>

        <Card className="it-hover-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-slate-500" />Tickets by Priority (Bar)</CardTitle>
          </CardHeader>
          <CardContent className="it-card-pad pt-0">
            <HorizontalBars data={priorityData} maxVal={maxPriority} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="it-hover-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><PieChart className="h-4 w-4 text-slate-500" />Category Distribution (Pie)</CardTitle>
          </CardHeader>
          <CardContent className="it-card-pad flex flex-col md:flex-row gap-6 items-center pt-0">
            <div className="w-48 h-48 rounded-full border border-slate-200" style={{ background: conicParts.length > 0 ? `conic-gradient(${conicParts.join(", ")})` : "#e2e8f0" }} />
            <div className="space-y-2 w-full">
              {categorySegments.length === 0 && <p className="text-sm text-slate-400">No category data yet</p>}
              {categorySegments.map((segment) => (
                <div key={segment.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span>{segment.name.replace("_", " ")}</span>
                  </div>
                  <Badge variant="outline" className="it-pill">{segment.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="it-hover-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-slate-500" />Recent Ticket Feed</CardTitle>
          </CardHeader>
          <CardContent className="it-card-pad space-y-3 pt-0">
            {tickets.slice(0, 6).map((ticket) => (
              <div key={ticket.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{ticket.title}</p>
                  <Badge variant="outline" className="it-pill">{ticket.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{ticket.createdBy?.name || "Unknown"} · {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
            ))}
            {tickets.length === 0 && <p className="text-sm text-slate-400">No tickets available</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
