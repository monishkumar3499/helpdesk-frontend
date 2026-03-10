"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

export type TicketCalendarItem = {
  id: string
  title: string
  status: string
  priority: "CRITICAL" | "HIGH" | "LOW"
  createdAt: string
  createdByName: string
}

type Props = {
  title: string
  subtitle: string
  tickets: TicketCalendarItem[]
  emptyDayText?: string
  pageSize?: number
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const PRIORITY_COLOR: Record<TicketCalendarItem["priority"], string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-400",
  LOW: "bg-blue-400",
}

function statusClass(status: string) {
  if (status === "RESOLVED") return "text-green-600 border-green-200"
  if (status === "IN_PROGRESS") return "text-orange-600 border-orange-200"
  return "text-blue-600 border-blue-200"
}

export function TicketCalendar({ title, subtitle, tickets, emptyDayText = "No tickets on this day", pageSize = 5 }: Props) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [selectedPage, setSelectedPage] = useState(0)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const ticketsByDay = useMemo(() => {
    const grouped: Record<number, TicketCalendarItem[]> = {}
    tickets.forEach((ticket) => {
      const date = new Date(ticket.createdAt)
      if (date.getMonth() !== month || date.getFullYear() !== year) return
      const day = date.getDate()
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(ticket)
    })
    return grouped
  }, [tickets, month, year])

  const selectedTickets = selectedDay ? ticketsByDay[selectedDay] || [] : []
  const pageCount = Math.max(1, Math.ceil(selectedTickets.length / pageSize))
  const pagedTickets = selectedTickets.slice(selectedPage * pageSize, (selectedPage + 1) * pageSize)

  useEffect(() => {
    setSelectedPage(0)
  }, [selectedDay, month, year])

  useEffect(() => {
    if (selectedPage >= pageCount) {
      setSelectedPage(0)
    }
  }, [selectedPage, pageCount])

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{MONTHS[month]} {year}</CardTitle>
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
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">{day}</div>
              ))}
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
                    <span className={`text-sm font-medium ${isSelected ? "text-white" : isToday ? "text-slate-800" : "text-slate-700"}`}>
                      {day}
                    </span>
                    {dayTickets.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {dayTickets.slice(0, 3).map((ticket) => (
                          <span key={ticket.id} className={`h-1.5 w-1.5 rounded-full ${PRIORITY_COLOR[ticket.priority]}`} />
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

            <div className="flex gap-4 mt-4 pt-4 border-t">
              {Object.entries(PRIORITY_COLOR).map(([priority, color]) => (
                <div key={priority} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  {priority}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              {selectedDay ? `${MONTHS[month]} ${selectedDay}` : "Select a day"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <p className="text-sm text-slate-400 text-center py-8">Click a date to see tickets</p>
            ) : selectedTickets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">{emptyDayText}</p>
            ) : (
              <div className="space-y-3">
                {pagedTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 leading-tight">{ticket.title}</p>
                      <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${PRIORITY_COLOR[ticket.priority]}`} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{ticket.createdByName}</p>
                    <Badge variant="outline" className={`mt-2 text-[10px] ${statusClass(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
                {selectedTickets.length > pageSize && (
                  <div className="flex items-center justify-between border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPage((prev) => Math.max(0, prev - 1))}
                      disabled={selectedPage === 0}
                    >
                      Previous 5
                    </Button>
                    <span className="text-xs text-slate-500">
                      {selectedPage + 1} / {pageCount}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPage((prev) => Math.min(pageCount - 1, prev + 1))}
                      disabled={selectedPage >= pageCount - 1}
                    >
                      Next 5
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
