"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ITAssetsKpis } from "../_components/it-assets-kpis"
import { ITAssetsList } from "../_components/it-assets-list"
import { ASSET_THRESHOLDS, normalizeAsset, type ITAsset } from "../_lib/it-shared"
import { Boxes, Sparkles } from "lucide-react"

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

export default function ITAssetsPage() {
  const [assets, setAssets] = useState<ITAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [assetTypeFilter, setAssetTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState("NEWEST")

  useEffect(() => {
    apiFetch("/assets", undefined, { forceBackend: true })
      .then((data) => setAssets(toArrayResponse<unknown>(data).map(normalizeAsset)))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false))
  }, [])

  const availableByType = useMemo(() => {
    const result = { HARDWARE: 0, SOFTWARE: 0, NETWORK: 0 }
    assets.forEach((asset) => { if (asset.assetStatus === "AVAILABLE") result[asset.assetType] += 1 })
    return result
  }, [assets])

  const lowStock = Object.entries(availableByType).filter(
    ([type, count]) => count < ASSET_THRESHOLDS[type as keyof typeof ASSET_THRESHOLDS],
  )

  const visibleAssets = useMemo(() => {
    const filtered = assets.filter((asset) => {
      if (assetTypeFilter !== "ALL" && asset.assetType !== assetTypeFilter) return false
      if (statusFilter !== "ALL" && asset.assetStatus !== statusFilter) return false
      if (!search.trim()) return true
      const haystack = `${asset.assetName} ${asset.serialNumber} ${asset.assignedTo?.name || ""}`.toLowerCase()
      return haystack.includes(search.toLowerCase())
    })

    return filtered.sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === "NAME_ASC") return a.assetName.localeCompare(b.assetName)
      if (sortBy === "NAME_DESC") return b.assetName.localeCompare(a.assetName)
      return a.assetStatus.localeCompare(b.assetStatus)
    })
  }, [assets, assetTypeFilter, search, sortBy, statusFilter])

  if (loading) return <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />

  return (
    <div className="it-page-stack">
      <ITAssetsKpis
        total={assets.length}
        available={assets.filter((asset) => asset.assetStatus === "AVAILABLE").length}
        assigned={assets.filter((asset) => asset.assetStatus === "ASSIGNED").length}
        thresholdAlerts={lowStock.length}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search asset name, serial, assignee"
            className="xl:col-span-2"
          />
          <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
            <SelectTrigger><SelectValue placeholder="Asset Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="HARDWARE">Hardware</SelectItem>
              <SelectItem value="SOFTWARE">Software</SelectItem>
              <SelectItem value="NETWORK">Network</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Asset Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest First</SelectItem>
              <SelectItem value="OLDEST">Oldest First</SelectItem>
              <SelectItem value="NAME_ASC">Name A-Z</SelectItem>
              <SelectItem value="NAME_DESC">Name Z-A</SelectItem>
              <SelectItem value="STATUS">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ITAssetsList assets={visibleAssets} />
    </div>
  )
}
