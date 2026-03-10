"use client"

import { ChangeEvent, FormEvent, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { getStoredUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Priority = "LOW" | "HIGH" | "CRITICAL"
type Department = "HR" | "IT"
type TicketIssueType = "GENERAL" | "ASSET_REQUEST" | "ASSET_PROBLEM"
type AssetClassification = "NETWORK" | "SOFTWARE" | "HARDWARE"

export default function RaiseTicketPage() {
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [priority, setPriority] = useState<Priority>("LOW")
  const [department, setDepartment] = useState<Department>("HR")
  const [issueType, setIssueType] = useState<TicketIssueType>("GENERAL")
  const [assetSerialNumber, setAssetSerialNumber] = useState("")
  const [assetCategory, setAssetCategory] = useState("")
  const [assetClassification, setAssetClassification] = useState<AssetClassification>("HARDWARE")
  const [requestedAssetName, setRequestedAssetName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    if (!title.trim() || !summary.trim()) return false
    if (department !== "IT") return true
    if (issueType === "GENERAL") return true
    if (!assetCategory.trim() || !assetClassification) return false
    if (issueType === "ASSET_REQUEST") return !!requestedAssetName.trim()
    return !!assetSerialNumber.trim()
  }, [
    title,
    summary,
    department,
    issueType,
    assetCategory,
    assetClassification,
    requestedAssetName,
    assetSerialNumber,
  ])

  function onDepartmentChange(value: Department) {
    setDepartment(value)
    if (value !== "IT") {
      setIssueType("GENERAL")
      setAssetSerialNumber("")
      setAssetCategory("")
      setAssetClassification("HARDWARE")
      setRequestedAssetName("")
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (!canSubmit) {
      setMessage("Please complete required fields before submitting")
      return
    }

    try {
      setLoading(true)

      const payload: Record<string, unknown> = {
        title: title.trim(),
        summary: summary.trim(),
        priority,
        department,
      }

      const currentUser = getStoredUser()
      if (currentUser?.id) {
        payload.createdById = currentUser.id
      }

      if (department === "IT") {
        payload.issueType = issueType
        if (issueType !== "GENERAL") {
          payload.assetIssue = {
            assetSerialNumber: issueType === "ASSET_PROBLEM" ? assetSerialNumber.trim() || null : null,
            assetCategory: assetCategory.trim() || null,
            assetClassification,
            requestedAssetName: requestedAssetName.trim() || null,
          }
        }
      }

      await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      setMessage("Ticket created successfully")
      setTitle("")
      setSummary("")
      setPriority("LOW")
      setDepartment("HR")
      setIssueType("GENERAL")
      setAssetSerialNumber("")
      setAssetCategory("")
      setAssetClassification("HARDWARE")
      setRequestedAssetName("")
      setImage(null)
      setPreview(null)
    } catch (error) {
      console.error("Failed to create ticket", error)
      setMessage(error instanceof Error ? error.message : "Failed to create ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Raise Ticket</h1>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-slate-700">Title</Label>
                  <Input
                    className="h-12 text-base bg-slate-50 border-slate-200"
                    placeholder="Enter issue title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-slate-700">Priority</Label>
                    <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-slate-700">Department</Label>
                    <Select value={department} onValueChange={(value) => onDepartmentChange(value as Department)}>
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold text-slate-700">Summary</Label>
                  <Textarea
                    className="resize-none h-45 bg-slate-50 border-slate-200 text-base"
                    placeholder="Describe the issue in detail"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                {department === "IT" && (
                  <div className="space-y-6 p-6 bg-slate-50/80 border border-slate-100 rounded-xl">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-slate-800 block">IT Ticket Type</Label>
                      <Select value={issueType} onValueChange={(value) => setIssueType(value as TicketIssueType)}>
                        <SelectTrigger className="h-11 bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">General IT Ticket</SelectItem>
                          <SelectItem value="ASSET_REQUEST">Asset Request</SelectItem>
                          <SelectItem value="ASSET_PROBLEM">Asset Problem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {issueType !== "GENERAL" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Asset Category</Label>
                        <Input
                          className="bg-white border-slate-200"
                          placeholder="Example: Laptop / Networking / Software"
                          value={assetCategory}
                          onChange={(event) => setAssetCategory(event.target.value)}
                        />
                      </div>
                    )}

                    {issueType !== "GENERAL" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Asset Classification</Label>
                        <Select
                          value={assetClassification}
                          onValueChange={(value) => setAssetClassification(value as AssetClassification)}
                        >
                          <SelectTrigger className="h-11 bg-white border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HARDWARE">HARDWARE</SelectItem>
                            <SelectItem value="SOFTWARE">SOFTWARE</SelectItem>
                            <SelectItem value="NETWORK">NETWORK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {issueType === "ASSET_PROBLEM" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Asset Serial Number</Label>
                        <Input
                          className="bg-white border-slate-200"
                          placeholder="Enter assigned asset serial number"
                          value={assetSerialNumber}
                          onChange={(event) => setAssetSerialNumber(event.target.value)}
                        />
                      </div>
                    )}

                    {(issueType === "ASSET_REQUEST" || issueType === "ASSET_PROBLEM") && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                          {issueType === "ASSET_REQUEST" ? "Requested Asset Name" : "Problem Details"}
                        </Label>
                        <Textarea
                          className="bg-white border-slate-200 resize-none h-24"
                          placeholder={
                            issueType === "ASSET_REQUEST"
                              ? "Example: 24-inch monitor"
                              : "Describe what is wrong with the asset"
                          }
                          value={requestedAssetName}
                          onChange={(event) => setRequestedAssetName(event.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 bg-slate-50/80 border border-slate-100 rounded-xl space-y-4 min-h-40">
                  <Label className="text-base font-semibold text-slate-700 block">Attach Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="file:bg-slate-800 file:text-white file:font-medium file:border-0 file:rounded-md file:px-4 file:py-1.5 file:mr-4 cursor-pointer h-12 py-2.5 bg-white border-slate-200"
                    onChange={handleImageChange}
                  />

                  {preview && (
                    <div className="relative inline-block mt-2 border border-slate-200 rounded-xl p-2 bg-white shadow-sm">
                      <img src={preview} className="w-full max-h-55 object-cover rounded-lg" alt="Attachment preview" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-3 -right-3 rounded-full h-8 w-8 shadow-md border-2 border-white"
                        onClick={() => {
                          setImage(null)
                          setPreview(null)
                        }}
                      >
                        x
                      </Button>
                    </div>
                  )}

                  {image && <p className="text-xs text-slate-500">Selected: {image.name}</p>}
                </div>
              </div>
            </div>

            {message && (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {message}
              </p>
            )}

            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-55 h-14 text-lg font-semibold" disabled={loading}>
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
