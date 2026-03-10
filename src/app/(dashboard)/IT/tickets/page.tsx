"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentUser, inferTicketCategory, isITAdmin, normalizeAsset, normalizeITRole, normalizeTicket, type ITAsset, type ITTicket, type ITUser } from "../_lib/it-shared"
import { Cog, PackageCheck, ShieldCheck, Sparkles, Wrench } from "lucide-react"


const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
}

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  LOW: "bg-blue-100 text-blue-700 border-blue-200",
}

export default function ITTicketsPage() {
  const [tickets, setTickets] = useState<ITTicket[]>([])
  const [assets, setAssets] = useState<ITAsset[]>([])
  const [team, setTeam] = useState<ITUser[]>([])
  const [selected, setSelected] = useState<ITTicket | null>(null)
  const [category, setCategory] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [selectedAssetId, setSelectedAssetId] = useState("")
  const currentUser = getCurrentUser()
  const role = normalizeITRole(currentUser?.role)
  const isAdmin = isITAdmin(role)

  useEffect(() => {
    Promise.all([
      apiFetch("/tickets?department=IT", undefined, { forceBackend: true }),
      apiFetch("/users?role=IT_SUPPORT", undefined, { forceBackend: true }),
      apiFetch("/assets", undefined, { forceBackend: true }),
    ])
      .then(([ticketData, userData, assetData]) => {
        setTickets((ticketData as unknown[]).map(normalizeTicket))
        setTeam((userData as ITUser[]).filter((member) => member.isActive !== false))
        setAssets((assetData as unknown[]).map(normalizeAsset))
      })
      .catch(() => {
        setTickets([])
        setTeam([])
        setAssets([])
      })
      .finally(() => setLoading(false))
  }, [])

  const currentMemberId = useMemo(() => {
    if (isAdmin) return null
    const byEmail = team.find((member) => member.email === currentUser?.email)
    if (byEmail?.id) return byEmail.id
    if (currentUser?.id && team.some((member) => member.id === currentUser.id)) return currentUser.id
    return null
  }, [isAdmin, currentUser?.id, currentUser?.email, team])

  const categories = useMemo(
    () => ["ALL", ...Array.from(new Set(tickets.map((ticket) => inferTicketCategory(ticket))))],
    [tickets],
  )

  const visibleTickets = useMemo(() => {
    const base = isAdmin ? tickets : (currentMemberId ? tickets.filter((ticket) => ticket.assignedToId === currentMemberId) : [])
    if (category === "ALL") return base
    return base.filter((ticket) => inferTicketCategory(ticket) === category)
  }, [tickets, isAdmin, currentMemberId, category])

  const openCount = visibleTickets.filter((ticket) => ticket.status === "OPEN").length
  const inProgressCount = visibleTickets.filter((ticket) => ticket.status === "IN_PROGRESS").length
  const resolvedCount = visibleTickets.filter((ticket) => ticket.status === "RESOLVED").length

  function closeModal() {
    setSelected(null)
    setComment("")
    setSelectedAssetId("")
  }

  async function patchTicket(id: string, payload: Record<string, unknown>) {
    try {
      await apiFetch(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }, { forceBackend: true })
    } catch {
      // Keep optimistic UI when backend update fails.
    }
  }

  async function handleStatus(status: ITTicket["status"]) {
    if (!selected) return
    await patchTicket(selected.id, { status })
    setTickets((prev) => prev.map((ticket) => (ticket.id === selected.id ? { ...ticket, status } : ticket)))
    closeModal()
  }

  async function patchAsset(id: string, payload: Record<string, string | null>) {
    try {
      const updated = await apiFetch(`/assets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }, { forceBackend: true })
      setAssets((prev) => prev.map((asset) => asset.id === id ? normalizeAsset(updated) : asset))
    } catch {
      // Keep optimistic UI when backend update fails.
    }
  }

  async function handleAssignAsset() {
    if (!selected || selected.issueType !== "ASSET_REQUEST" || !selectedAssetId || !selected.createdById) return

    await patchAsset(selectedAssetId, { assetStatus: "ASSIGNED", assignedToId: selected.createdById })
    const nextAssetIssue = {
      ...(selected.assetIssue || {}),
      assetId: selectedAssetId,
      assetCategory: "ASSET_REQUEST",
    }
    await patchTicket(selected.id, { assetIssue: nextAssetIssue, status: "RESOLVED" })
    setTickets((prev) => prev.map((ticket) => (
      ticket.id === selected.id ? { ...ticket, assetIssue: nextAssetIssue, status: "RESOLVED" } : ticket
    )))
    setSelected((prev) => (prev ? { ...prev, assetIssue: nextAssetIssue, status: "RESOLVED" } : prev))
    setAssets((prev) => prev.map((asset) => (
      asset.id === selectedAssetId ? { ...asset, assetStatus: "ASSIGNED", assignedToId: selected.createdById } : asset
    )))
  }

  async function handleMarkMaintenance() {
    if (!selected || selected.issueType !== "ASSET_PROBLEM") return
    const targetAssetId = selected.assetIssue?.assetId
    if (!targetAssetId) return

    const current = assets.find((asset) => asset.id === targetAssetId)
    if (!current) return

    const nextAssetStatus = current.assetStatus === "MAINTENANCE"
      ? (current.assignedToId ? "ASSIGNED" : "AVAILABLE")
      : "MAINTENANCE"

    await patchAsset(targetAssetId, { assetStatus: nextAssetStatus })
    setAssets((prev) => prev.map((asset) => (
      asset.id === targetAssetId ? { ...asset, assetStatus: nextAssetStatus } : asset
    )))
    setTickets((prev) => prev.map((ticket) => (
      ticket.id === selected.id ? { ...ticket, status: "IN_PROGRESS" } : ticket
    )))
    setSelected((prev) => (prev ? { ...prev, status: "IN_PROGRESS" } : prev))
  }

  const selectedAssignableAssets = useMemo(() => {
    if (!selected || selected.issueType !== "ASSET_REQUEST") return []
    const wantedName = selected.assetIssue?.requestedAssetName?.toLowerCase() || ""
    const wantedClass = selected.assetIssue?.assetClassification
    return assets.filter((asset) => {
      if (asset.assetStatus !== "AVAILABLE") return false
      if (wantedClass && asset.assetType !== wantedClass) return false
      if (wantedName && !asset.assetName.toLowerCase().includes(wantedName)) return false
      return true
    })
  }, [assets, selected])

  const selectedProblemAsset = useMemo(() => {
    if (!selected || selected.issueType !== "ASSET_PROBLEM") return null
    const assetId = selected.assetIssue?.assetId
    if (!assetId) return null
    return assets.find((asset) => asset.id === assetId) || null
  }, [assets, selected])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => <div key={index} className="h-36 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="it-page-stack">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-sky-900 p-6 text-white shadow-lg">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="it-hero-title">IT Tickets</h2>
            <p className="it-hero-subtitle text-slate-200">
              {visibleTickets.length} tickets · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-xs text-slate-300 mt-1">Role: {role === "IT_ADMIN" ? "IT Admin" : "IT Support"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-56 border-white/20 bg-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((item) => <SelectItem key={item} value={item}>{item.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Active Queue
              <Sparkles className="h-4 w-4 text-sky-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Open", value: openCount, color: "border-l-blue-500" },
          { label: "In Progress", value: inProgressCount, color: "border-l-amber-500" },
          { label: "Resolved", value: resolvedCount, color: "border-l-green-500" },
        ].map((item) => (
          <Card key={item.label} className={`border-l-4 ${item.color} it-hover-card`}>
            <CardContent className="it-card-pad-sm flex items-center justify-between">
              <p className="it-kpi-label text-sm">{item.label}</p>
              <p className="it-kpi-value text-slate-800">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleTickets.map((ticket) => (
          <Card
            key={ticket.id}
            className={`cursor-pointer border it-hover-card ${ticket.issueType === "ASSET_REQUEST" ? "border-emerald-200 bg-emerald-50/30" : ticket.issueType === "ASSET_PROBLEM" ? "border-amber-200 bg-amber-50/30" : "border-slate-200"}`}
            onClick={() => {
              setSelected(ticket)
              setSelectedAssetId(ticket.assetIssue?.assetId || "")
            }}
          >
            <CardHeader className="pb-2 px-5 pt-5">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{ticket.title}</span>
                <span className={`it-pill ${STATUS_COLOR[ticket.status] || "bg-slate-100 text-slate-700"}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="it-card-pad space-y-3 pt-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">
                    {(ticket.createdBy?.name || "IT").split(" ").map((part) => part[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{ticket.createdBy?.name || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{ticket.id}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{ticket.summary}</p>
              {ticket.issueType && ticket.issueType !== "GENERAL" && (
                <div className="space-y-1 rounded-md border border-slate-200 bg-white px-2.5 py-2">
                  <p className="text-[11px] text-slate-500">Asset Issue Type</p>
                  <p className="text-xs font-semibold text-slate-700">{ticket.issueType === "ASSET_REQUEST" ? "Asset Request" : "Asset Problem"}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Badge variant="outline" className="it-pill">{ticket.assetIssue?.assetClassification || "N/A"}</Badge>
                    {ticket.assetIssue?.requestedAssetName && <span>{ticket.assetIssue.requestedAssetName}</span>}
                    {ticket.assetIssue?.assetId && <span>Asset ID: {ticket.assetIssue.assetId.slice(0, 8)}</span>}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={`it-pill border ${PRIORITY_COLOR[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={closeModal}>
        {selected && (
          <DialogContent className="max-w-md border-slate-200 shadow-2xl">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
              <DialogDescription>
                Review ticket details and update workflow actions for this item.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-slate-700 text-white text-lg font-bold">
                    {(selected.createdBy?.name || "IT").split(" ").map((part) => part[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-slate-800">{selected.createdBy?.name || "Unknown"}</p>
                  <p className="text-sm text-slate-500">{selected.id}</p>
                  <span className={`it-pill border ${PRIORITY_COLOR[selected.priority]}`}>
                    {selected.priority}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Category</span><span className="font-medium">{inferTicketCategory(selected).replace("_", " ")}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Status</span><span className={`it-pill ${STATUS_COLOR[selected.status] || "bg-slate-100 text-slate-700"}`}>{selected.status.replace("_", " ")}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Assigned</span><span className="font-medium">{selected.assignedTo?.name || team.find((member) => member.id === selected.assignedToId)?.name || "Unassigned"}</span></div>
              </div>

              {selected.issueType && selected.issueType !== "GENERAL" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4 space-y-2">
                  <p className="text-xs font-medium text-emerald-700">Asset Issue Details</p>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Issue Type</span><span className="font-medium">{selected.issueType === "ASSET_REQUEST" ? "Asset Request" : "Asset Problem"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Classification</span><span className="font-medium">{selected.assetIssue?.assetClassification || "N/A"}</span></div>
                  {selected.issueType === "ASSET_REQUEST" && (
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Requested Asset</span><span className="font-medium">{selected.assetIssue?.requestedAssetName || "N/A"}</span></div>
                  )}
                  {selected.issueType === "ASSET_PROBLEM" && (
                    <>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Asset ID</span><span className="font-medium">{selected.assetIssue?.assetId || "N/A"}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Asset Status</span><span className="font-medium">{selectedProblemAsset?.assetStatus || "Unknown"}</span></div>
                    </>
                  )}
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1 font-medium">Description</p>
                <p className="text-sm text-slate-800">{selected.summary || "No details provided."}</p>
              </div>

              {!isAdmin && selected.status !== "RESOLVED" && (
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium">Internal Comment (optional)</p>
                  <Textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Add a comment for internal tracking..."
                    className="text-sm resize-none"
                    rows={2}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {!isAdmin && selected.status === "OPEN" && (
                  <Button variant="outline" className="flex-1 text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => handleStatus("IN_PROGRESS")}>
                    Accept
                  </Button>
                )}
                {!isAdmin && selected.status === "IN_PROGRESS" && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatus("RESOLVED")}>
                    Resolve
                  </Button>
                )}
                {!isAdmin && selected.status === "IN_PROGRESS" && selected.issueType === "ASSET_REQUEST" && (
                  <Button variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={handleAssignAsset} disabled={!selectedAssetId}>
                    <PackageCheck className="mr-1 h-4 w-4" />
                    Assign Asset
                  </Button>
                )}
                {!isAdmin && selected.status === "IN_PROGRESS" && selected.issueType === "ASSET_PROBLEM" && (
                  <Button variant="outline" className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50" onClick={handleMarkMaintenance} disabled={!selected.assetIssue?.assetId}>
                    <Wrench className="mr-1 h-4 w-4" />
                    {selectedProblemAsset?.assetStatus === "MAINTENANCE" ? "Remove Maintenance" : "Mark Maintenance"}
                  </Button>
                )}
                {isAdmin && <p className="w-full rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-slate-600">IT Admin has read-only access in ticket details.</p>}
              </div>

              {!isAdmin && selected.status === "IN_PROGRESS" && selected.issueType === "ASSET_REQUEST" && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Assign matching asset</p>
                  <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                    <SelectTrigger><SelectValue placeholder="Select available asset" /></SelectTrigger>
                    <SelectContent>
                      {selectedAssignableAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>{asset.assetName} ({asset.serialNumber})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAssignableAssets.length === 0 && (
                    <p className="text-xs text-amber-600 inline-flex items-center gap-1"><Cog className="h-3.5 w-3.5" />No available matching assets.</p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
