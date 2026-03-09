import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { getCurrentUser, inferTicketCategory, isOverdue, normalizeTicket, type ITTicket, type ITUser } from "./it-shared"
import { ADMIN_ALERTS_KEY, BoardView, MOCK_IT_TEAM, REJECTION_MAP_KEY } from "./it-ticket-board-shared"

export function useITTicketBoard(view: BoardView) {
  const [tickets, setTickets] = useState<ITTicket[]>([])
  const [team, setTeam] = useState<ITUser[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState("ALL")
  const [category, setCategory] = useState("ALL")
  const [assignTo, setAssignTo] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentRole] = useState<string>(() => getCurrentUser()?.role || "IT")

  useEffect(() => {
    const sessionUser = getCurrentUser()
    Promise.all([apiFetch("/tickets?department=IT"), apiFetch("/users?role=IT")])
      .then(([ticketData, userData]) => {
        const activeTeam = (userData as ITUser[]).filter((member) => member.isActive !== false)
        setTickets(ticketData.map(normalizeTicket))
        setTeam(activeTeam.length > 0 ? activeTeam : MOCK_IT_TEAM)
        setCurrentUserId(activeTeam.find((m) => m.email === sessionUser?.email)?.id || null)
        setUsingMock(false)
      })
      .catch(() => {
        setTeam(MOCK_IT_TEAM)
        setUsingMock(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const isAdmin = currentRole === "ADMIN"
  const categories = useMemo<string[]>(
    () => ["ALL", ...Array.from(new Set(tickets.map((ticket) => inferTicketCategory(ticket))))],
    [tickets],
  )

  const visibleTickets = useMemo(() => {
    let base = !isAdmin && currentUserId ? tickets.filter((t) => t.assignedToId === currentUserId) : tickets
    if (view === "assigned") base = base.filter((t) => t.status === "OPEN")
    if (view === "accepted") base = base.filter((t) => t.status === "IN_PROGRESS")
    if (view === "resolved") base = base.filter((t) => t.status === "RESOLVED")
    return base
      .filter((ticket) => {
        if (priority !== "ALL" && ticket.priority !== priority) return false
        if (category !== "ALL" && inferTicketCategory(ticket) !== category) return false
        if (!search.trim()) return true
        const text = `${ticket.title} ${ticket.summary} ${ticket.createdBy?.name || ""}`.toLowerCase()
        return text.includes(search.toLowerCase())
      })
      .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)))
  }, [tickets, isAdmin, currentUserId, view, priority, category, search])

  return {
    tickets, team, loading, usingMock, search, priority, category, assignTo, banner,
    currentUserId, isAdmin, categories, visibleTickets,
    setSearch, setPriority, setCategory, setAssignTo, setBanner, setTickets,
  }
}

export function getRejectionMap() {
  if (typeof window === "undefined") return {} as Record<string, string[]>
  try { return JSON.parse(localStorage.getItem(REJECTION_MAP_KEY) || "{}") as Record<string, string[]> } catch { return {} }
}

export function saveRejectionMap(next: Record<string, string[]>) {
  localStorage.setItem(REJECTION_MAP_KEY, JSON.stringify(next))
}

export function addAdminAlert(message: string) {
  const existing = localStorage.getItem(ADMIN_ALERTS_KEY)
  const alerts: string[] = existing ? JSON.parse(existing) : []
  localStorage.setItem(ADMIN_ALERTS_KEY, JSON.stringify([message, ...alerts.filter((i) => i !== message)].slice(0, 20)))
}
