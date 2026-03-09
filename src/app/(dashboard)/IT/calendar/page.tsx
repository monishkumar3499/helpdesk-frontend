"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles } from "lucide-react"
import { getCurrentUser, isITAdmin, normalizeTicket, type ITTicket } from "../_lib/it-shared"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const PRIORITY_DOT: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-400",
  LOW: "bg-blue-400",
}

export default function ITCalendarPage() {
  const currentUser = getCurrentUser()
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [tickets, setTickets] = useState<ITTicket[]>([])

  useEffect(() => {
    apiFetch("/tickets?department=IT", undefined, { forceBackend: true })
      .then((data) => {
        const normalized = (data as unknown[]).map(normalizeTicket)
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

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]

  const ticketsByDay = useMemo(() => {
    const map: Record<number, ITTicket[]> = {}
    tickets.forEach((ticket) => {
      const date = new Date(ticket.createdAt)
      if (date.getMonth() === month && date.getFullYear() === year) {
        const day = date.getDate()
        if (!map[day]) map[day] = []
        map[day].push(ticket)
      }
    })
    return map
  }, [tickets, month, year])

  const selectedTickets = selectedDay ? ticketsByDay[selectedDay] || [] : []

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((prev) => prev - 1)
    } else {
      setMonth((prev) => prev - 1)
    }
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((prev) => prev + 1)
    } else {
      setMonth((prev) => prev + 1)
    }
    setSelectedDay(null)
  }

  return (
    <div className="it-page-stack">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-cyan-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-200/40 blur-2xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h2 className="it-hero-title text-slate-800">Calendar</h2>
            <p className="it-hero-subtitle text-slate-500">IT ticket activity overview</p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-sm">
            <CalendarDays className="h-4 w-4 text-sky-600" />
            Timeline Lens
            <Sparkles className="h-4 w-4 text-cyan-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 it-hover-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{MONTHS[month]} {year}</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="it-card-pad pt-0">
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day) => <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} />
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const isSelected = day === selectedDay
                const dayTickets = ticketsByDay[day] || []
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative rounded-lg p-1.5 min-h-13 text-left transition-all ${isSelected ? "bg-slate-800 text-white" : "hover:bg-slate-100"} ${isToday && !isSelected ? "ring-2 ring-slate-800" : ""}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? "text-white" : isToday ? "text-slate-800" : "text-slate-700"}`}>{day}</span>
                    {dayTickets.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {dayTickets.slice(0, 3).map((ticket) => <span key={ticket.id} className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[ticket.priority]}`} />)}
                        {dayTickets.length > 3 && <span className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>+{dayTickets.length - 3}</span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-4 mt-4 pt-4 border-t">
              {Object.entries(PRIORITY_DOT).map(([priority, color]) => (
                <div key={priority} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${color}`} />{priority}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="it-hover-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              {selectedDay ? `${MONTHS[month]} ${selectedDay}` : "Select a day"}
            </CardTitle>
          </CardHeader>
          <CardContent className="it-card-pad pt-0">
            {!selectedDay ? (
              <p className="text-sm text-slate-400 text-center py-8">Click a date to see tickets</p>
            ) : selectedTickets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No IT tickets on this day</p>
            ) : (
              <div className="space-y-3">
                {selectedTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 leading-tight">{ticket.title}</p>
                      <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${PRIORITY_DOT[ticket.priority]}`} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{ticket.createdBy?.name || "Unknown"}</p>
                    <Badge variant="outline" className="it-pill mt-2">
                      {ticket.status.replace("_", " ")}
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
