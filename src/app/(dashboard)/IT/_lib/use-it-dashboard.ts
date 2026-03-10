import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import {
  ASSET_THRESHOLDS,
  getCurrentUser,
  getMemberLoad,
  inferTicketCategory,
  isOverdue,
  normalizeAsset,
  normalizeTicket,
  isITAdmin,
  normalizeITRole,
  type ITAsset,
  type ITTicket,
  type ITUser,
} from "./it-shared"

const ADMIN_ALERTS_KEY = "it_admin_alerts"

function toArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (
    payload
    && typeof payload === "object"
    && "data" in payload
    && Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data
  }
  return []
}

export function useITDashboard() {
  const currentUser = getCurrentUser()
  const [tickets, setTickets] = useState<ITTicket[]>([])
  const [assets, setAssets] = useState<ITAsset[]>([])
  const [team, setTeam] = useState<ITUser[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [adminAlerts] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem(ADMIN_ALERTS_KEY) || "[]") as string[] } catch { return [] }
  })
  const [role] = useState(() => normalizeITRole(currentUser?.role))
  const supportMemberId = useMemo(() => {
    if (isITAdmin(role)) return null
    const byEmail = team.find((member) => member.email === currentUser?.email)
    if (byEmail?.id) return byEmail.id
    if (currentUser?.id && team.some((member) => member.id === currentUser.id)) return currentUser.id
    return null
  }, [currentUser?.email, currentUser?.id, role, team])

  useEffect(() => {
    Promise.all([
      apiFetch("/tickets?department=IT"),
      apiFetch("/assets"),
      apiFetch("/users?role=IT_SUPPORT"),
    ])
      .then(([ticketData, assetData, userData]) => {
        const normalizedTickets = toArrayResponse<unknown>(ticketData).map(normalizeTicket)
        const normalizedAssets = toArrayResponse<unknown>(assetData).map(normalizeAsset)
        const activeTeam = toArrayResponse<ITUser>(userData).filter((member) => member.isActive !== false)

        setAssets(normalizedAssets)
        setTeam(activeTeam)

        if (isITAdmin(role)) {
          setTickets(normalizedTickets)
        } else {
          const supportId =
            activeTeam.find((member) => member.email === currentUser?.email)?.id ||
            (currentUser?.id && activeTeam.some((member) => member.id === currentUser.id) ? currentUser.id : undefined)
          setTickets(supportId ? normalizedTickets.filter((ticket) => ticket.assignedToId === supportId) : [])
        }
        setUsingMock(false)
      })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false))
  }, [currentUser?.email, currentUser?.id, role])

  const categoryStats = useMemo(() => {
    const counts = { SOFTWARE: 0, HARDWARE: 0, NETWORK: 0, GENERAL: 0 }
    tickets.forEach((ticket) => { counts[inferTicketCategory(ticket)] += 1 })
    return counts
  }, [tickets])

  const overdueTickets = useMemo(() => tickets.filter(isOverdue), [tickets])
  const assetAvailability = useMemo(() => {
    const counts = { HARDWARE: 0, SOFTWARE: 0, NETWORK: 0 }
    assets.forEach((asset) => { if (asset.assetStatus === "AVAILABLE") counts[asset.assetType] += 1 })
    return counts
  }, [assets])

  const lowStockAlerts = useMemo(
    () => Object.entries(assetAvailability).filter(([type, count]) => count < ASSET_THRESHOLDS[type as keyof typeof ASSET_THRESHOLDS]),
    [assetAvailability],
  )

  const memberLoads = useMemo(
    () => {
      const scopedTeam = isITAdmin(role)
        ? team
        : team.filter((member) => member.id === supportMemberId)
      return scopedTeam
        .map((m) => ({
          ...m,
          load: getMemberLoad(tickets, m.id),
          resolved: tickets.filter((t) => t.assignedToId === m.id && t.status === "RESOLVED").length,
        }))
        .sort((a, b) => a.load - b.load)
    },
    [team, tickets, role, supportMemberId],
  )

  return { tickets, loading, usingMock, role, categoryStats, overdueTickets, lowStockAlerts, memberLoads, adminAlerts }
}
