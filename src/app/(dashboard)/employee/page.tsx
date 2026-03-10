"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, BarChart3, Activity } from "lucide-react"
import { apiFetch, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

type Ticket = {
  id: string
  title: string
  summary: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  priority: "CRITICAL" | "HIGH" | "LOW"
  createdBy?: {
    name: string
  }
}

function BarChart({
  data,
  maxVal
}: {
  data: { label: string; value: number; color: string }[]
  maxVal: number
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-24 shrink-0">
            {item.label}
          </span>

          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full rounded-full ${item.color} flex items-center justify-end pr-2`}
              style={{
                width: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%`
              }}
            >
              <span className="text-[10px] text-white font-bold">
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {

  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    if (authLoading) return

    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    fetchTickets()

  }, [authLoading, isAuthenticated])

  async function fetchTickets() {

    try {

      const data: Ticket[] = await apiFetch("/tickets/mine")
      setTickets(data)

    } catch (err) {

      if (err instanceof ApiError) {
        console.error(`API Error ${err.statusCode}: ${err.message}`)
        setError(err.message)
      } else {
        console.error("Failed to fetch tickets:", err)
        setError("Failed to load tickets")
      }

    } finally {
      setLoading(false)
    }

  }

  if (authLoading) {
    return <p className="text-sm text-gray-500">Checking authentication...</p>
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading reports...</p>
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-red-700">Error loading tickets</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  const open = tickets.filter((t) => t.status === "OPEN").length
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length
  const resolved = tickets.filter((t) => t.status === "RESOLVED").length
  const critical = tickets.filter((t) => t.priority === "CRITICAL").length

  const statusData = [
    { label: "Open", value: open, color: "bg-blue-500" },
    { label: "In Progress", value: inProgress, color: "bg-yellow-500" },
    { label: "Resolved", value: resolved, color: "bg-green-500" }
  ]

  const maxStatus = Math.max(...statusData.map((d) => d.value), 1)

  const priorityData = [
    { label: "Critical", value: critical, color: "bg-red-500" },
    {
      label: "High",
      value: tickets.filter((t) => t.priority === "HIGH").length,
      color: "bg-orange-500"
    },
    {
      label: "Low",
      value: tickets.filter((t) => t.priority === "LOW").length,
      color: "bg-blue-500"
    }
  ]

  const maxPriority = Math.max(...priorityData.map((d) => d.value), 1)

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Reports & Analytics
        </h2>
        <p className="text-sm text-slate-500">
          Live ticket data 
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500">Total Tickets</p>
              <p className="text-3xl font-bold">{tickets.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500">In Progress</p>
              <p className="text-3xl font-bold">{inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500">Resolved</p>
              <p className="text-3xl font-bold">{resolved}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <BarChart3 className="h-4 w-4" />
              Tickets by Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <BarChart data={statusData} maxVal={maxStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Activity className="h-4 w-4" />
              Tickets by Priority
            </CardTitle>
          </CardHeader>

          <CardContent>
            <BarChart data={priorityData} maxVal={maxPriority} />
          </CardContent>
        </Card>

      </div>

      <div>

        <h3 className="text-lg font-semibold text-slate-700 mb-3">
          Recent Tickets
        </h3>

        <div className="space-y-2">

          {tickets.slice(0, 5).map((ticket) => (

            <div
              key={ticket.id}
              className="flex justify-between items-center bg-white border rounded-lg px-4 py-3"
            >

              <div>
                <p className="text-sm font-medium">
                  {ticket.createdBy?.name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">{ticket.title}</p>
              </div>

              <div className="flex gap-2">

                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {ticket.status}
                </span>

                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                  {ticket.priority}
                </span>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
} 

