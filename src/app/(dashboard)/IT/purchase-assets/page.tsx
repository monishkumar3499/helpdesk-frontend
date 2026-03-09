"use client"

import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { PurchaseAssetForm } from "../_components/purchase-asset-form"
import { getCurrentUser } from "../_lib/it-shared"

export default function PurchaseAssetsPage() {
  const [assetName, setAssetName] = useState("")
  const [assetType, setAssetType] = useState("HARDWARE")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const isAdmin = (getCurrentUser()?.role || "IT") === "ADMIN"

  async function handlePurchase() {
    setLoading(true)
    setMessage("")
    try {
      const now = Date.now()
      const calls = Array.from({ length: quantity }).map((_, index) => apiFetch("/assets", {
        method: "POST",
        body: JSON.stringify({ serialNumber: `AST-${assetType.slice(0, 2)}-${String(now + index).slice(-6)}`, assetName, assetType }),
      }))
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
    <div className="space-y-6 max-w-xl">
      <div><h2 className="text-2xl font-bold text-slate-800">Purchase Assets</h2><p className="text-sm text-slate-500 mt-1">Add new asset stock when threshold alerts are triggered</p></div>
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
