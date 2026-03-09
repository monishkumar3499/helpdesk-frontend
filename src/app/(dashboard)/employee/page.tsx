"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, BarChart3, Activity } from "lucide-react"

type Ticket = {
  id: string
  category: string
  employeeName: string
  status: string
  priority: string
  accepted: boolean
  hrComment?: string
  rejectedReason?: string
}

function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-24 shrink-0">{item.label}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full rounded-full ${item.color} flex items-center justify-end pr-2 transition-all duration-700`}
              style={{ width: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%` }}
            >
              <span className="text-[10px] text-white font-bold">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    // Read from localStorage — same data as Tickets page
    const stored = localStorage.getItem("hr_tickets")
    if (stored) setTickets(JSON.parse(stored))
  }, [])

  const open = tickets.filter(t => t.status === "OPEN").length
  const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length
  const resolved = tickets.filter(t => t.status === "RESOLVED").length
  const rejected = tickets.filter(t => t.status === "REJECTED").length
  const critical = tickets.filter(t => t.priority === "CRITICAL").length
  const Accepted = tickets.filter(t => t.accepted).length

  const statusData = [
    { label: "Open", value: open, color: "bg-blue-500" },
    { label: "In Progress", value: inProgress, color: "bg-yellow-500" },
    { label: "Resolved", value: resolved, color: "bg-green-500" },
    { label: "Rejected", value: rejected, color: "bg-red-500" },
  ]
  const maxStatus = Math.max(...statusData.map(d => d.value), 1)

  const priorityData = [
    { label: "Critical", value: critical, color: "bg-red-500" },
    { label: "High", value: tickets.filter(t => t.priority === "HIGH").length, color: "bg-orange-400" },
    { label: "Low", value: tickets.filter(t => t.priority === "LOW").length, color: "bg-blue-400" },
  ]
  const maxPriority = Math.max(...priorityData.map(d => d.value), 1)

  const submitterCount: Record<string, number> = {}
  tickets.forEach(t => {
    submitterCount[t.employeeName] = (submitterCount[t.employeeName] || 0) + 1
  })
  const topSubmitters = Object.entries(submitterCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // HR commented tickets
  const commentedTickets = tickets.filter(t => t.hrComment)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">Employee · Live data</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Tickets", value: tickets.length, color: "border-l-blue-500", textColor: "text-slate-800", icon: <BarChart3 className="h-8 w-8 text-blue-400" /> },
          { label: "Accepted", value: `${Accepted}`, color: "border-l-green-500", textColor: "text-green-600", icon: <CheckCircle2 className="h-8 w-8 text-green-400" /> },
          { label: "Rejected", value: rejected, color: "border-l-red-800", textColor: "text-red-800", icon: <Users className="h-8 w-8 text-red-400" /> },
        ].map(kpi => (
          <Card key={kpi.label} className={`border-l-4 ${kpi.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.textColor}`}>{kpi.value}</p>
                </div>
                {kpi.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />Tickets by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={statusData} maxVal={maxStatus} />
            <div className="flex gap-4 mt-4 pt-4 border-t flex-wrap">
              <div className="text-center"><p className="text-xl font-bold text-blue-600">{open}</p><p className="text-xs text-slate-500">Open</p></div>
              <div className="text-center"><p className="text-xl font-bold text-yellow-600">{inProgress}</p><p className="text-xs text-slate-500">In Progress</p></div>
              <div className="text-center"><p className="text-xl font-bold text-green-600">{resolved}</p><p className="text-xs text-slate-500">Resolved</p></div>
              <div className="text-center"><p className="text-xl font-bold text-red-600">{rejected}</p><p className="text-xs text-slate-500">Rejected</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />Tickets by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={priorityData} maxVal={maxPriority} />
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-slate-500">Avg. Resolution Time</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">18 hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Submitters */}
        <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Recent Tickets</h3>
            <div className="space-y-2">
              {tickets.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between bg-white rounded-lg border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{t.createdBy?.name || "Unknown"}</p>
                    <p className="text-xs text-slate-500">{t.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === "OPEN" ? "bg-blue-100 text-blue-700" :
                      t.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                      t.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>{t.status.replace("_", " ")}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.priority === "CRITICAL" ? "bg-red-100 text-red-700" :
                      t.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

      {/* HR Comments Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            💬 Comments Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commentedTickets.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No comments yet</p>
          ) : (
            <div className="space-y-3">
              {commentedTickets.map(t => (
                <div key={t.id} className={`p-3 rounded-lg border-l-2 ${
                  t.status === "REJECTED" ? "bg-red-50 border-red-400" : "bg-green-50 border-green-400"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-800">{t.employeeName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      t.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{t.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-slate-600"><span className="font-medium">Employee: </span>{t.hrComment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
