"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { ITAssetsKpis } from "../_components/it-assets-kpis"
import { ITAssetsList } from "../_components/it-assets-list"
import { ITLowStockAlerts } from "../_components/it-low-stock-alerts"
import { ASSET_THRESHOLDS, normalizeAsset, type ITAsset } from "../_lib/it-shared"

export default function ITAssetsPage() {
  const [assets, setAssets] = useState<ITAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch("/assets")
      .then((data) => setAssets(data.map(normalizeAsset)))
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

  if (loading) return <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-800">IT Assets</h2><p className="text-sm text-slate-500 mt-1">Inventory and assignment overview</p></div>
      <ITAssetsKpis
        total={assets.length}
        available={assets.filter((asset) => asset.assetStatus === "AVAILABLE").length}
        assigned={assets.filter((asset) => asset.assetStatus === "ASSIGNED").length}
        thresholdAlerts={lowStock.length}
      />
      <ITLowStockAlerts lowStock={lowStock} />
      <ITAssetsList assets={assets} />
    </div>
  )
}
