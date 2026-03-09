"use client"

import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { PurchaseAssetForm } from "../_components/purchase-asset-form"
import { getCurrentUser, isITAdmin } from "../_lib/it-shared"
import { Boxes, Sparkles } from "lucide-react"

export default function PurchaseAssetsPage() {
  const [assetName, setAssetName] = useState("")
  const [assetType, setAssetType] = useState("HARDWARE")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const isAdmin = isITAdmin(getCurrentUser()?.role)

  async function handlePurchase() {
    setLoading(true)
    setMessage("")
    try {
      const now = Date.now()
      const calls = Array.from({ length: quantity }).map((_, index) => apiFetch("/assets", {
        method: "POST",
        body: JSON.stringify({ serialNumber: `AST-${assetType.slice(0, 2)}-${String(now + index).slice(-6)}`, assetName, assetType }),
      }, { forceBackend: true }))
      await Promise.all(calls)
      setMessage(`Purchased and added ${quantity} ${assetType.toLowerCase()} assets.`)
      setAssetName("")
      setQuantity(1)
    } catch {
      setMessage("Asset purchase failed. Check backend availability and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return <Card><CardContent className="py-10 text-center text-slate-600">Only IT admin can access purchase operations.</CardContent></Card>
  }

  return (
    <div className="it-page-stack max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-cyan-900 p-6 text-white shadow-lg">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="it-hero-title">Purchase Assets</h2>
            <p className="it-hero-subtitle text-slate-200">Add new asset stock when threshold alerts are triggered.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs">
            <Boxes className="h-4 w-4 text-cyan-200" />
            Procurement Control
            <Sparkles className="h-4 w-4 text-sky-200" />
          </div>
        </div>
      </div>

      <PurchaseAssetForm
        assetName={assetName}
        assetType={assetType}
        quantity={quantity}
        loading={loading}
        message={message}
        onAssetName={setAssetName}
        onAssetType={setAssetType}
        onQuantity={setQuantity}
        onSubmit={handlePurchase}
      />
    </div>
  )
}
