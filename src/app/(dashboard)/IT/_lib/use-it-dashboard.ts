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
  type ITAsset,
  type ITTicket,
  type ITUser,
} from "./it-shared"

const ADMIN_ALERTS_KEY = "it_admin_alerts"

export function useITDashboard() {
  const [tickets, setTickets] = useState<ITTicket[]>([])
  const [assets, setAssets] = useState<ITAsset[]>([])
  const [team, setTeam] = useState<ITUser[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [adminAlerts] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem(ADMIN_ALERTS_KEY) || "[]") as string[] } catch { return [] }
  })
  const [role] = useState(() => getCurrentUser()?.role || "IT")

  useEffect(() => {
    Promise.all([apiFetch("/tickets?department=IT"), apiFetch("/assets"), apiFetch("/users?role=IT")])
      .then(([ticketData, assetData, userData]) => {
        setTickets(ticketData.map(normalizeTicket))
        setAssets(assetData.map(normalizeAsset))
        setTeam((userData as ITUser[]).filter((member) => member.isActive !== false))
        setUsingMock(false)
      })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false))
  }, [])

  const categoryStats = useMemo(() => {
    const counts = { SOFTWARE: 0, HARDWARE: 0, NETWORK: 0, ASSET_REQUEST: 0, GENERAL: 0 }
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
    () => team.map((m) => ({ ...m, load: getMemberLoad(tickets, m.id), resolved: tickets.filter((t) => t.assignedToId === m.id && t.status === "RESOLVED").length })).sort((a, b) => a.load - b.load),
    [team, tickets],
  )

  return { tickets, loading, usingMock, role, categoryStats, overdueTickets, lowStockAlerts, memberLoads, adminAlerts }
}
