"use client"

import { useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
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

export default function RaiseTicketPage() {
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [priority, setPriority] = useState<Priority>("LOW")
  const [department, setDepartment] = useState<Department>("HR")
  const [isAssetRequest, setIsAssetRequest] = useState(false)
  const [isServiceRequest, setIsServiceRequest] = useState(false)
  const [assetDescription, setAssetDescription] = useState("")
  const [serviceDescription, setServiceDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    if (!title.trim() || !summary.trim()) return false
    if (department !== "IT") return true
    return isAssetRequest || isServiceRequest
  }, [title, summary, department, isAssetRequest, isServiceRequest])

  function onDepartmentChange(value: Department) {
    setDepartment(value)
    if (value !== "IT") {
      setIsAssetRequest(false)
      setIsServiceRequest(false)
      setAssetDescription("")
      setServiceDescription("")
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

      if (department === "IT") {
        if (isAssetRequest && !isServiceRequest) {
          payload.issueType = "ASSET_REQUEST"
          payload.assetIssue = {
            assetCategory: "HARDWARE",
            assetClassification: "HARDWARE",
            requestedAssetName: assetDescription.trim() || "Requested asset",
            assetId: null,
          }
        } else if (!isAssetRequest && isServiceRequest) {
          payload.issueType = "ASSET_PROBLEM"
          payload.assetIssue = {
            assetCategory: "NETWORK",
            assetClassification: "NETWORK",
            requestedAssetName: serviceDescription.trim() || "Service request",
            assetId: null,
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
      setIsAssetRequest(false)
      setIsServiceRequest(false)
      setAssetDescription("")
      setServiceDescription("")
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
                      <Label className="text-base font-semibold text-slate-800 block">Request Type</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={isAssetRequest ? "default" : "outline"}
                          onClick={() => setIsAssetRequest((prev) => !prev)}
                        >
                          Asset
                        </Button>
                        <Button
                          type="button"
                          variant={isServiceRequest ? "default" : "outline"}
                          onClick={() => setIsServiceRequest((prev) => !prev)}
                        >
                          Service
                        </Button>
                      </div>
                    </div>

                    {isAssetRequest && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Asset Description</Label>
                        <Textarea
                          className="bg-white border-slate-200 resize-none h-24"
                          placeholder="Provide details about required asset"
                          value={assetDescription}
                          onChange={(event) => setAssetDescription(event.target.value)}
                        />
                      </div>
                    )}

                    {isServiceRequest && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Service Description</Label>
                        <Textarea
                          className="bg-white border-slate-200 resize-none h-24"
                          placeholder="Provide details about service issue"
                          value={serviceDescription}
                          onChange={(event) => setServiceDescription(event.target.value)}
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
