"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Ticket = {
  id: string
  title: string
  summary: string
  category?: string
  employeeName?: string
  employeeId?: string
  priority: string
  status: string
  department: string
  hrComment?: string
  rejectedReason?: string
  createdAt?:string 
  createdBy?: { name: string; id: string }
}

const MOCK_TICKETS: Ticket[] = [
  { id: "1", title: "Leave Request", summary: "I need 3 days sick leave due to fever", category: "Leave Request", employeeName: "Aarav Kumar", employeeId: "EMP001", priority: "HIGH", status: "OPEN", department: "HR" },
  // Add more mock tickets as necessary...
]

const priorityColor: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  LOW: "bg-blue-100 text-blue-700 border-blue-200",
}

const statusColor: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
}

export default function HrTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [category, setCategory] = useState("All")
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [hrComment, setHrComment] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectBox, setShowRejectBox] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      try {
        const response = await apiFetch("/tickets?department=HR")
        const normalized = response.data.map((t: any) => ({
          ...t,
          category: t.title,
          employeeName: t.createdBy?.name || "Unknown",
          employeeId: t.createdBy?.id?.slice(0, 8).toUpperCase() || "N/A",
          summary: t.summary || "",
        }))
        setTickets(normalized)
        setUsingMock(false)
      } catch (error) {
        console.error("Error fetching tickets:", error)
        setTickets(MOCK_TICKETS)
        setUsingMock(true)
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem("hr_tickets", JSON.stringify(tickets))
    }
  }, [tickets])

  const filtered = category === "All"
    ? tickets
    : tickets.filter(t => t.category === category || t.title === category)

  async function handleResolve() {
    if (!selected) return
    try {
      if (!usingMock) {
        await apiFetch(`/tickets/${selected.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "RESOLVED" }),
        })
      }
      setTickets(prev => prev.map(t => 
        t.id === selected.id 
          ? { ...t, status: "RESOLVED", hrComment: hrComment || "Ticket resolved by HR." } 
          : t 
      ))
    } catch (error) {
      console.error("Error resolving ticket:", error)
    } finally {
      closeModal()
    }
  }

  async function handleInProgress() {
    if (!selected) return
    try {
      if (!usingMock) {
        await apiFetch(`/tickets/${selected.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "IN_PROGRESS" }),
        })
      }
      setTickets(prev => prev.map(t => 
        t.id === selected.id 
          ? { ...t, status: "IN_PROGRESS", hrComment: hrComment || undefined } 
          : t 
      ))
    } catch (error) {
      console.error("Error marking ticket as in progress:", error)
    } finally {
      closeModal()
    }
  }

  async function handleReject() {
    if (!selected || !rejectReason.trim()) return
    try {
      if (!usingMock) {
        await apiFetch(`/tickets/${selected.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "REJECTED" }),
        })
      }
      setTickets(prev => prev.map(t => 
        t.id === selected.id 
          ? { ...t, status: "REJECTED", rejectedReason: rejectReason, hrComment: rejectReason } 
          : t 
      ))
    } catch (error) {
      console.error("Error rejecting ticket:", error)
    } finally {
      closeModal()
    }
  }

  function openTicket(ticket: Ticket) {
    setSelected(ticket)
    setHrComment(ticket.hrComment || "")
    setRejectReason(ticket.rejectedReason || "")
    setShowRejectBox(false)
  }

  function closeModal() {
    setSelected(null)
    setHrComment("")
    setRejectReason("")
    setShowRejectBox(false)
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-36 rounded-xl bg-slate-100 animate-pulse" />)}
    </div>
  )

  return (
         
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">HR Tickets</h2>
        <Select onValueChange={setCategory} defaultValue="All">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Leave Request">Leave Request</SelectItem>
            <SelectItem value="Payroll Issue">Payroll Issue</SelectItem>
            <SelectItem value="Onboarding">Onboarding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open", count: tickets.filter(t => t.status === "OPEN").length, color: "border-l-blue-500" },
          { label: "In Progress", count: tickets.filter(t => t.status === "IN_PROGRESS").length, color: "border-l-yellow-500" },
          { label: "Resolved", count: tickets.filter(t => t.status === "RESOLVED").length, color: "border-l-green-500" },
          // { label: "Rejected", count: tickets.filter(t => t.status === "REJECTED").length, color: "border-l-red-500" },
        ].map(s => (
          <Card key={s.label} className={`border-l-4 ${s.color}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Ticket Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map(ticket => (
          <Card key={ticket.id}
            className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-slate-200"
            onClick={() => openTicket(ticket)}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{ticket.category || ticket.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[ticket.status]}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">
                    {(ticket.employeeName || "?").split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{ticket.employeeName || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{ticket.employeeId || "—"}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{ticket.summary}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short",year:"numeric" })}
                </span>
              </div>
              {ticket.hrComment && (
                <div className={`text-xs p-2 rounded-lg border-l-2 ${
                  ticket.status === "REJECTED"
                    ? "bg-red-50 border-red-400 text-red-700"
                    : "bg-green-50 border-green-400 text-green-700"
                }`}>
                  <span className="font-semibold">HR: </span>{ticket.hrComment}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={!!selected} onOpenChange={closeModal}>
        {selected && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-slate-700 text-white text-lg font-bold">
                    {(selected.employeeName || "?").split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-slate-800">{selected.employeeName || "Unknown"}</p>
                  <p className="text-sm text-slate-500">{selected.employeeId || "—"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor[selected.priority]}`}>
                    {selected.priority}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium">{selected.category || selected.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>
                    {selected.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Department</span>
                  <span className="font-medium">{selected.department}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1 font-medium">Description</p>
                <p className="text-sm text-slate-800">{selected.summary}</p>
              </div>

              {selected.status !== "REJECTED" && selected.status !== "RESOLVED" && (
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium">HR Comment (optional)</p>
                  <Textarea
                    placeholder="Add a comment for the employee..."
                    value={hrComment}
                    onChange={(e) => setHrComment(e.target.value)}
                    className="text-sm resize-none"
                    rows={2}
                  />
                </div>
              )}

              {showRejectBox && (
                <div>
                  <p className="text-xs text-red-500 mb-1 font-medium">Rejection Reason (required)</p>
                  <Textarea
                    placeholder="Please provide a reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="text-sm resize-none border-red-200"
                    rows={2}
                  />
                </div>
              )}

              {selected.hrComment && (["RESOLVED", "REJECTED", "IN_PROGRESS"].includes(selected.status)) && (
                <div className={`text-sm p-3 rounded-lg border-l-2 ${
                  selected.status === "REJECTED" ? "bg-red-50 border-red-400 text-red-700" : "bg-green-50 border-green-400 text-green-700"
                }`}>
                  <p className="font-semibold text-xs mb-1">HR Comment:</p>
                  <p>{selected.hrComment}</p>
                </div>
              )}

              {selected.status !== "RESOLVED" && selected.status !== "REJECTED" && (
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50" onClick={handleInProgress}>
                    In Progress
                  </Button>
                  {/* {!showRejectBox ? (
                    <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowRejectBox(true)}>
                      Reject
                    </Button>
                  ) : (
                    <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={!rejectReason.trim()}>
                      Confirm Reject
                    </Button>
                  )} */}
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleResolve}>
                    Resolve ✓
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
