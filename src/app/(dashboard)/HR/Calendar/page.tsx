"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"

type Ticket = {
  id: string
  title: string
  summary?: string // Added for completeness, if needed
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  priority: "LOW" | "HIGH" | "CRITICAL"
  createdAt: string
  createdBy: { name: string }
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const priorityColor: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-400",
  LOW: "bg-blue-400",
}

export default function CalendarPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())

  useEffect(() => {
    apiFetch("/tickets?department=HR")
      .then((response) => {
        // Ensure the fetched data is an array
        if (Array.isArray(response.data)) {
          setTickets(response.data);
        } else {
          console.error("Fetched data is not an array:", response.data);
          setTickets([]);
        }
      })
      .catch(() => {
        // Mock data fallback
        const mock: Ticket[] = [
          { id: "1", title: "Leave Request - Sick", status: "OPEN", priority: "HIGH", createdAt: new Date().toISOString(), createdBy: { name: "Aarav Sharma" } },
          { id: "2", title: "Payroll Discrepancy", status: "IN_PROGRESS", priority: "CRITICAL", createdAt: new Date(Date.now() - 86400000).toISOString(), createdBy: { name: "Priya Nair" } },
          { id: "3", title: "Onboarding Documents", status: "RESOLVED", priority: "LOW", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), createdBy: { name: "Rohan Mehta" } },
          { id: "4", title: "Benefits Enrollment", status: "OPEN", priority: "HIGH", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), createdBy: { name: "Sneha Pillai" } },
        ];
        setTickets(mock);
      });
  }, []);

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  // Group tickets by day
  const ticketsByDay: Record<number, Ticket[]> = {}
  tickets.forEach((t) => {
    const d = new Date(t.createdAt)
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const day = d.getDate()
      if (!ticketsByDay[day]) ticketsByDay[day] = []
      ticketsByDay[day].push(t)
    }
  })

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
    setSelectedDay(null)
  }
  
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
    setSelectedDay(null)
  }

  const selectedTickets = selectedDay ? (ticketsByDay[selectedDay] || []) : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Calendar</h2>
        <p className="text-sm text-slate-500 mt-1">HR ticket activity overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {MONTHS[currentMonth]} {currentYear}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day heading */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
              ))}
            </div>
            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                const isSelected = day === selectedDay
                const dayTickets = ticketsByDay[day] || []
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      relative rounded-lg p-1.5 min-h-[52px] text-left transition-all
                      ${isSelected ? "bg-slate-800 text-white" : "hover:bg-slate-100"}
                      ${isToday && !isSelected ? "ring-2 ring-slate-800" : ""}
                    `}
                  >
                    <span className={`text-sm font-medium ${isSelected ? "text-white" : isToday ? "text-slate-800" : "text-slate-700"}`}>
                      {day}
                    </span>
                    {dayTickets.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {dayTickets.slice(0, 3).map((t) => (
                          <span key={t.id} className={`h-1.5 w-1.5 rounded-full ${priorityColor[t.priority]}`} />
                        ))}
                        {dayTickets.length > 3 && (
                          <span className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>+{dayTickets.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend column */}
            <div className="flex gap-4 mt-4 pt-4 border-t">
              {Object.entries(priorityColor).map(([p, c]) => (
                <div key={p} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${c}`} />
                  {p}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Day Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              {selectedDay ? `${MONTHS[currentMonth]} ${selectedDay}` : "Select a day"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <p className="text-sm text-slate-400 text-center py-8">Click a date to see tickets</p>
            ) : selectedTickets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No tickets on this day</p>
            ) : (
              <div className="space-y-3">
                {selectedTickets.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 leading-tight">{t.title}</p>
                      <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${priorityColor[t.priority]}`} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t.createdBy.name}</p>
                    <Badge
                      variant="outline"
                      className={`mt-2 text-[10px] ${
                        t.status === "RESOLVED" ? "text-green-600 border-green-200" :
                        t.status === "IN_PROGRESS" ? "text-orange-600 border-orange-200" :
                        "text-blue-600 border-blue-200"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
