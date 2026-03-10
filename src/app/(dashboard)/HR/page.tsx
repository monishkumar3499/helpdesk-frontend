"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Ticket = {
  id: string; title: string; status: string
  priority: string; department: string
  createdBy?: { name: string }
}

export default function HrDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    apiFetch("/tickets")
      .then((data) => {
        const validTickets = Array.isArray(data) ? data : (data?.tickets || data?.data || [])
        setTickets(validTickets)
        // Also sync to localStorage for Reports page
        localStorage.setItem("hr_tickets", JSON.stringify(
          validTickets.map((t: any) => ({
            ...t,
            category: t.title,
            employeeName: t.createdBy?.name || "Unknown",
            summary: t.summary || "",
          }))
        ))
        setUsingMock(false)
      })
      .catch(() => {
        const stored = localStorage.getItem("hr_tickets")
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setTickets(Array.isArray(parsed) ? parsed : [])
          } catch(e) {
            setTickets([])
          }
        }
        setUsingMock(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const safeTickets = Array.isArray(tickets) ? tickets : []
  const open = safeTickets.filter(t => t.status === "OPEN").length
  const inProgress = safeTickets.filter(t => t.status === "IN_PROGRESS").length
  const resolved = safeTickets.filter(t => t.status === "RESOLVED").length
  const rejected = safeTickets.filter(t => t.status === "REJECTED").length
  const critical = safeTickets.filter(t => t.priority === "CRITICAL").length
  const resolutionRate = safeTickets.length > 0 ? Math.round((resolved / safeTickets.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">HR Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {usingMock && <span className="ml-2 text-orange-500">(Demo data — backend offline)</span>}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Tickets", value: safeTickets.length, color: "border-l-blue-500", textColor: "text-slate-800" },
              { label: "Open", value: open, color: "border-l-orange-500", textColor: "text-orange-600" },
              { label: "In Progress", value: inProgress, color: "border-l-yellow-500", textColor: "text-yellow-600" },
              { label: "Resolved", value: resolved, color: "border-l-green-500", textColor: "text-green-600" },
              { label: "Rejected", value: rejected, color: "border-l-red-500", textColor: "text-red-600" },
              { label: "Critical", value: critical, color: "border-l-red-900", textColor: "text-red-900" },
              { label: "Resolution Rate", value: `${resolutionRate}%`, color: "border-l-purple-500", textColor: "text-purple-600" },
            ].map(kpi => (
              <Card key={kpi.label} className={`border-l-4 ${kpi.color}`}>
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-xs text-slate-500">{kpi.label}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className={`text-3xl font-bold ${kpi.textColor}`}>{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
            <Card className="border-l-4 border-l-slate-500 flex items-center justify-center">
              <Link href="/HR/Tickets" className="w-full p-4">
                <Button className="w-full bg-slate-800 hover:bg-slate-700">View Tickets →</Button>
              </Link>
            </Card>
          </div>

          {/* Recent Tickets */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Recent Tickets</h3>
            <div className="space-y-2">
              {safeTickets.slice(0, 5).map(t => (
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
        </>
      )}
    </div>
  )
}
