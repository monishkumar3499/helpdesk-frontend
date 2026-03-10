"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type IssueType = "GENERAL" | "ASSET_REQUEST" | "ASSET_PROBLEM"
type AssetType = "HARDWARE" | "SOFTWARE" | "NETWORK"

type AssetLite = {
  id: string
  serialNumber: string
  assetName: string
  assetType: AssetType
  assetStatus: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED"
  assignedToId?: string | null
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

function getCurrentUser() {
  if (typeof window === "undefined") return null as { id?: string; email?: string } | null
  try {
    return JSON.parse(localStorage.getItem("user") || "null") as { id?: string; email?: string } | null
  } catch {
    return null
  }
}

export default function RaiseTicketPage() {
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [priority, setPriority] = useState("LOW")
  const [issueType, setIssueType] = useState<IssueType>("GENERAL")
  const [classification, setClassification] = useState<AssetType>("HARDWARE")
  const [assetSearch, setAssetSearch] = useState("")
  const [requestAssetId, setRequestAssetId] = useState("")
  const [problemAssetId, setProblemAssetId] = useState("")
  const [assets, setAssets] = useState<AssetLite[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const currentUser = getCurrentUser()

  useEffect(() => {
    apiFetch("/assets")
      .then((data) => setAssets(toArrayResponse<AssetLite>(data)))
      .catch(() => setAssets([]))
  }, [])

  const requestMatches = useMemo(() => {
    return assets.filter((asset) => (
      asset.assetStatus === "AVAILABLE"
      && asset.assetType === classification
      && (!assetSearch.trim() || asset.assetName.toLowerCase().includes(assetSearch.toLowerCase()))
    ))
  }, [assets, classification, assetSearch])

  const employeeAssets = useMemo(() => {
    if (!currentUser?.id) return [] as AssetLite[]
    return assets.filter((asset) => asset.assignedToId === currentUser.id)
  }, [assets, currentUser?.id])

  async function submitTicket() {
    if (!title.trim() || !summary.trim()) return
    if (issueType === "ASSET_PROBLEM" && !problemAssetId) return

    setLoading(true)
    setMessage("")
    try {
      const requestedAsset = assets.find((asset) => asset.id === requestAssetId)
      await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title,
          summary,
          department: "IT",
          priority,
          createdById: currentUser?.id,
          issueType,
          assetIssue: issueType === "GENERAL"
            ? null
            : {
              assetCategory: classification,
              assetClassification: classification,
              requestedAssetName: issueType === "ASSET_REQUEST" ? (requestedAsset?.assetName || assetSearch || null) : null,
              assetId: issueType === "ASSET_PROBLEM" ? problemAssetId : null,
            },
        }),
      })

      setMessage("Ticket raised successfully. IT support will process your request.")
      setTitle("")
      setSummary("")
      setPriority("LOW")
      setIssueType("GENERAL")
      setClassification("HARDWARE")
      setAssetSearch("")
      setRequestAssetId("")
      setProblemAssetId("")
    } catch {
      setMessage("Unable to raise ticket right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Raise Ticket</h2>
        <p className="mt-1 text-sm text-slate-500">Create general IT tickets, asset requests, or asset problem reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ticket Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Issue Type</Label>
              <Select value={issueType} onValueChange={(v) => setIssueType(v as IssueType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General IT Ticket</SelectItem>
                  <SelectItem value="ASSET_REQUEST">Asset Request</SelectItem>
                  <SelectItem value="ASSET_PROBLEM">Asset Problem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Need monitor for analytics desk" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Describe your issue or request." />
          </div>

          {issueType !== "GENERAL" && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div className="space-y-1">
                <Label>Classification</Label>
                <Select value={classification} onValueChange={(v) => setClassification(v as AssetType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HARDWARE">Hardware</SelectItem>
                    <SelectItem value="SOFTWARE">Software</SelectItem>
                    <SelectItem value="NETWORK">Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {issueType === "ASSET_REQUEST" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="asset-search">Requested Asset Name</Label>
                    <Input id="asset-search" value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} placeholder="Type product name, e.g., Monitor" />
                  </div>
                  <div className="space-y-1">
                    <Label>Available Matching Assets</Label>
                    <Select value={requestAssetId} onValueChange={setRequestAssetId}>
                      <SelectTrigger><SelectValue placeholder="Select a matching asset" /></SelectTrigger>
                      <SelectContent>
                        {requestMatches.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.assetName} ({asset.serialNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {issueType === "ASSET_PROBLEM" && (
                <div className="space-y-1">
                  <Label>Asset ID / Asset</Label>
                  <Select value={problemAssetId} onValueChange={setProblemAssetId}>
                    <SelectTrigger><SelectValue placeholder="Select your assigned asset" /></SelectTrigger>
                    <SelectContent>
                      {employeeAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.assetName} ({asset.serialNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <Button onClick={submitTicket} disabled={loading || !title.trim() || !summary.trim()} className="w-full bg-slate-800 hover:bg-slate-700">
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>

          {message && <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p>}
        </CardContent>
      </Card>
    </div>
  )
}