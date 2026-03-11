"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, History, Search, Sparkles } from "lucide-react"

type ITAssetAssignment = {
  id: string
  assetId: string
  assignedById: string
  assignedToId: string
  assignedAt: string
  asset?: {
    id?: string
    assetName?: string
    serialNumber?: string
    assetType?: string
    assetStatus?: string
  } | null
  assignedBy?: {
    id?: string
    name?: string
    email?: string
    role?: string
  } | null
  assignedTo?: {
    id?: string
    name?: string
    email?: string
    role?: string
  } | null
}

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

function normalizeAssignment(raw: unknown): ITAssetAssignment {
  const entry = (raw ?? {}) as Partial<ITAssetAssignment>
  return {
    id: entry.id || "",
    assetId: entry.assetId || entry.asset?.id || "",
    assignedById: entry.assignedById || entry.assignedBy?.id || "",
    assignedToId: entry.assignedToId || entry.assignedTo?.id || "",
    assignedAt: entry.assignedAt || new Date().toISOString(),
    asset: entry.asset || null,
    assignedBy: entry.assignedBy || null,
    assignedTo: entry.assignedTo || null,
  }
}

export default function ITAssetLogPage() {
  const [logs, setLogs] = useState<ITAssetAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    apiFetch("/assets/assignments")
      .then((data) => setLogs(toArrayResponse<unknown>(data).map(normalizeAssignment)))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  const visibleLogs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return logs
    return logs.filter((entry) => {
      const haystack = [
        entry.asset?.assetName || "",
        entry.asset?.serialNumber || "",
        entry.assignedBy?.name || "",
        entry.assignedBy?.email || "",
        entry.assignedTo?.name || "",
        entry.assignedTo?.email || "",
      ].join(" ").toLowerCase()
      return haystack.includes(q)
    })
  }, [logs, search])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => <div key={index} className="h-36 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="it-page-stack">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-cyan-900 p-6 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="it-hero-title">Asset Assignment Logs</h2>
            <p className="it-hero-subtitle text-slate-200">Audit trail of who assigned which asset to whom</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs backdrop-blur-sm">
            <History className="h-4 w-4 text-emerald-300" />
            {visibleLogs.length} records
            <Sparkles className="h-4 w-4 text-sky-200" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search asset, serial number, assigner, assignee"
            className="pl-9"
          />
        </div>
      </div>

      {visibleLogs.length === 0 && (
        <Card className="border-dashed border-slate-300 bg-slate-50">
          <CardContent className="py-10 text-center text-slate-600">
            No asset assignment logs found.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleLogs.map((entry) => (
          <Card key={entry.id} className="border-slate-200 shadow-sm it-hover-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="line-clamp-1 font-semibold text-slate-800">{entry.asset?.assetName || "Unknown Asset"}</span>
                <Badge variant="outline" className="it-pill border-sky-200 bg-sky-50 text-sky-700">
                  {entry.asset?.assetType || "N/A"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-xs text-slate-500">Serial: <span className="font-medium text-slate-700">{entry.asset?.serialNumber || "N/A"}</span></p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Assigned by</p>
                <p className="font-medium text-slate-800">{entry.assignedBy?.name || "Unknown"}</p>
                <p className="text-xs text-slate-500">{entry.assignedBy?.email || "N/A"}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Assigned to</p>
                <p className="font-medium text-slate-800">{entry.assignedTo?.name || "Unknown"}</p>
                <p className="text-xs text-slate-500">{entry.assignedTo?.email || "N/A"}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" />Audit record</span>
                <span>{new Date(entry.assignedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
