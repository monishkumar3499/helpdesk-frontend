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
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  priority: "LOW" | "HIGH" | "CRITICAL"
  createdAt: string
  createdBy: { name: string }
}

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
]

const priorityColor: Record<string,string> = {
  CRITICAL:"bg-red-500",
  HIGH:"bg-orange-400",
  LOW:"bg-blue-400"
}

export default function CalendarPage(){

  const today = new Date()

  const [currentMonth,setCurrentMonth] = useState(today.getMonth())
  const [currentYear,setCurrentYear] = useState(today.getFullYear())
  const [tickets,setTickets] = useState<Ticket[]>([])
  const [selectedDay,setSelectedDay] = useState<number | null>(today.getDate())
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    async function loadTickets(){

      try{

        const data = await apiFetch("/tickets")

        setTickets(data)

      }catch(err){

        console.error("Failed to fetch tickets:",err)

      }finally{

        setLoading(false)

      }

    }

    loadTickets()

  },[])

  if(loading){
    return <p className="p-6 text-sm text-gray-500">Loading calendar...</p>
  }

  /* Calendar Layout */

  const firstDay = new Date(currentYear,currentMonth,1).getDay()

  const daysInMonth = new Date(currentYear,currentMonth+1,0).getDate()

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({length:daysInMonth},(_,i)=>i+1)
  ]

  /* Safe Date Parser */

  function parseTicketDate(dateStr:string){

    if(dateStr.includes("T")){
      return new Date(dateStr)
    }

    try{

      const [datePart] = dateStr.split(",")

      const [day,month,year] = datePart.split("/").map(Number)

      return new Date(year,month-1,day)

    }catch{
      return new Date(dateStr)
    }

  }

  /* Group tickets by day */

  const ticketsByDay:Record<number,Ticket[]> = {}

  tickets.forEach(ticket=>{

    const date = parseTicketDate(ticket.createdAt)

    if(
      date.getMonth()===currentMonth &&
      date.getFullYear()===currentYear
    ){

      const day = date.getDate()

      if(!ticketsByDay[day]) ticketsByDay[day] = []

      ticketsByDay[day].push(ticket)

    }

  })

  /* Navigation */

  const prevMonth=()=>{

    if(currentMonth===0){
      setCurrentMonth(11)
      setCurrentYear(y=>y-1)
    }else{
      setCurrentMonth(m=>m-1)
    }

    setSelectedDay(null)

  }

  const nextMonth=()=>{

    if(currentMonth===11){
      setCurrentMonth(0)
      setCurrentYear(y=>y+1)
    }else{
      setCurrentMonth(m=>m+1)
    }

    setSelectedDay(null)

  }

  const selectedTickets = selectedDay ? (ticketsByDay[selectedDay] || []) : []

  return(

    <div className="space-y-6">

      {/* Title */}

      <div>
        <h2 className="text-2xl font-bold text-slate-800">Calendar</h2>
        <p className="text-sm text-slate-500 mt-1">
          Ticket activity from database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar */}

        <Card className="lg:col-span-2">

          <CardHeader className="pb-3">

            <div className="flex items-center justify-between">

              <CardTitle className="text-lg">
                {MONTHS[currentMonth]} {currentYear}
              </CardTitle>

              <div className="flex gap-1">

                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4"/>
                </Button>

                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4"/>
                </Button>

              </div>

            </div>

          </CardHeader>

          <CardContent>

            {/* Weekdays */}

            <div className="grid grid-cols-7 mb-2">

              {DAYS.map(day=>(
                <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">
                  {day}
                </div>
              ))}

            </div>

            {/* Calendar Grid */}

            <div className="grid grid-cols-7 gap-1">

              {cells.map((day,index)=>{

                if(!day) return <div key={index}/>

                const dayTickets = ticketsByDay[day] || []

                const isToday =
                  day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear()

                return(

                  <button
                    key={day}
                    onClick={()=>setSelectedDay(day)}
                    className={`relative rounded-lg p-2 min-h-[56px] text-left hover:bg-slate-100
                    ${isToday ? "bg-blue-50 border border-blue-200" : ""}`}
                  >

                    <span className="text-sm font-medium text-slate-700">
                      {day}
                    </span>

                    {dayTickets.length>0 && (
                      <span className="absolute top-1 right-1 text-[10px] bg-slate-700 text-white rounded-full px-1">
                        {dayTickets.length}
                      </span>
                    )}

                    {dayTickets.length>0 && (

                      <div className="flex flex-wrap gap-1 mt-1">

                        {dayTickets.slice(0,3).map(ticket=>(
                          <span
                            key={ticket.id}
                            className={`h-2 w-2 rounded-full ${priorityColor[ticket.priority]}`}
                          />
                        ))}

                      </div>

                    )}

                  </button>

                )

              })}

            </div>

          </CardContent>

        </Card>

        {/* Day Tickets */}

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-base">

              <CalendarDays className="h-4 w-4 text-slate-500"/>

              {selectedDay
                ? `${MONTHS[currentMonth]} ${selectedDay}`
                : "Select a day"}

            </CardTitle>

          </CardHeader>

          <CardContent>

            {selectedTickets.length===0 ? (

              <p className="text-sm text-slate-400 text-center py-8">
                No tickets on this day
              </p>

            ) : (

              <div className="space-y-3">

                {selectedTickets.map(ticket=>(
                  <div key={ticket.id} className="p-3 bg-slate-50 rounded-lg border">

                    <p className="text-sm font-medium text-slate-800">
                      {ticket.title}
                    </p>

                    <p className="text-xs text-slate-500">
                      {ticket.createdBy?.name}
                    </p>

                    <Badge className="mt-2 text-xs">
                      {ticket.status.replace("_"," ")}
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