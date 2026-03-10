"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { columns, Asset } from "./columns"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function MyAssetsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Asset | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    fetchAssets()
  }, [authLoading, isAuthenticated])

  async function fetchAssets() {
    try {
      const res = await apiFetch("/assets/mine")
      setAssets(res.data)
    } catch (err) {
      console.error("Failed to fetch assets:", err)
    } finally {
      setLoading(false)
    }
  }

  function handleRowClick(asset: Asset) {
    setSelected({ ...asset })
    setOpen(true)
  }

  if (authLoading) {
    return <p className="p-6 text-slate-500 animate-pulse">Checking authentication...</p>
  }

  if (loading) {
    return <p className="p-6 text-slate-500 animate-pulse">Loading assets...</p>
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          My Assets
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-4 sm:p-6 mb-8">
        <DataTable
          columns={columns}
          data={assets}
          onRowClick={handleRowClick}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-800">Asset Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Name</Label>
                  <p className="font-medium text-slate-800">{selected.assetName}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial Number</Label>
                  <p className="font-mono text-sm font-medium text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md w-max">{selected.serialNumber}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</Label>
                  <p className="font-medium text-slate-800">{selected.assetType}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</Label>
                  <p className="font-medium text-slate-800">{selected.assetStatus}</p>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned On</Label>
                  <p className="font-medium text-slate-800">
                    {selected.assignedDate ? new Date(selected.assignedDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </p>
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-slate-100 flex gap-4 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)} 
                  className="w-full sm:w-auto min-w-[120px] hover:bg-slate-100"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
