"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"

type FormValues = {
  title: string
  summary: string
  priority: "LOW" | "HIGH" | "CRITICAL"
  department: "HR" | "IT"
  isAsset: boolean
  isService: boolean
  assetDescription: string
  serviceDescription: string
}

const PRIORITY_CONFIG = {
  LOW:      { label: "Low",      dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  HIGH:     { label: "High",     dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200"     },
  CRITICAL: { label: "Critical", dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 border-rose-200"        },
}

export default function RaiseTicketPage() {
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      summary: "",
      priority: "LOW",
      department: "HR",
      isAsset: false,
      isService: false,
      assetDescription: "",
      serviceDescription: ""
    }
  })

  const department = form.watch("department")
  const isAsset = form.watch("isAsset")
  const isService = form.watch("isService")
  const priority = form.watch("priority")

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function onSubmit(values: FormValues) {
    if (values.department === "IT" && !values.isAsset && !values.isService) {
      toast.error("Please select at least one request type for IT department")
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("summary", values.summary)
      formData.append("priority", values.priority)
      formData.append("department", values.department)

      if (values.department === "IT") {
        if (values.isAsset) formData.append("assetDescription", values.assetDescription)
        if (values.isService) formData.append("serviceDescription", values.serviceDescription)
      }

      if (image) formData.append("image", image)

      await apiFetch("/tickets", { method: "POST", body: formData })
      toast.success("Ticket created successfully")
      form.reset()
      setPreview(null)
      setImage(null)
    } catch (error) {
      toast.error("Failed to create ticket")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Raise a Ticket</h1>
            <p className="text-sm text-slate-500">Fill in the details below and we'll get back to you shortly.</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">

                  {/* ─── Left: Main Details ─── */}
                  <div className="p-8 md:p-10 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-100">

                    <div className="space-y-1 pb-3 border-b border-slate-100">
                      <h2 className="text-base font-bold text-slate-800">Ticket Details</h2>
                      <p className="text-sm text-slate-500">Provide a clear description of your issue</p>
                    </div>

                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      rules={{ required: "Title is required" }}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Title <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="h-12 text-base bg-slate-50 border-slate-200 rounded-xl placeholder:text-slate-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-slate-300 transition-colors"
                              placeholder="e.g. Cannot access company VPN"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    {/* Priority + Department */}
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="priority"
                        rules={{ required: "Priority is required" }}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-slate-700">
                              Priority <span className="text-rose-500">*</span>
                            </FormLabel>
                            <Select required onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl text-base focus:bg-white focus:ring-2 focus:ring-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(["LOW", "HIGH", "CRITICAL"] as const).map(p => (
                                  <SelectItem key={p} value={p}>
                                    <span className="flex items-center gap-2 text-base">
                                      <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
                                      {PRIORITY_CONFIG[p].label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department"
                        rules={{ required: "Department is required" }}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-slate-700">
                              Department <span className="text-rose-500">*</span>
                            </FormLabel>
                            <Select
                              required
                              onValueChange={(val) => {
                                field.onChange(val)
                                if (val !== "IT") {
                                  form.setValue("isAsset", false)
                                  form.setValue("isService", false)
                                  form.setValue("assetDescription", "")
                                  form.setValue("serviceDescription", "")
                                }
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl text-base focus:bg-white focus:ring-2 focus:ring-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="HR"><span className="text-base">HR</span></SelectItem>
                                <SelectItem value="IT"><span className="text-base">IT</span></SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Summary */}
                    <FormField
                      control={form.control}
                      name="summary"
                      rules={{ required: "Summary is required" }}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Summary <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className="resize-none h-48 bg-slate-50 border-slate-200 rounded-xl text-base leading-relaxed placeholder:text-slate-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-slate-300 transition-colors py-3"
                              placeholder="Describe your issue in detail — include steps to reproduce, expected vs. actual behaviour, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ─── Right: IT Options + Attachment ─── */}
                  <div className="p-8 md:p-10 space-y-8 bg-slate-50/60">

                    {/* IT Request Type */}
                    {department === "IT" ? (
                      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1 pb-3 border-b border-slate-200">
                          <h2 className="text-base font-bold text-slate-800">IT Request Type</h2>
                          <p className="text-sm text-slate-500">Select one or both that apply</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Asset Toggle */}
                          <button
                            type="button"
                            onClick={() => form.setValue("isAsset", !isAsset)}
                            className={`relative flex flex-col items-start gap-2 p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
                              ${isAsset
                                ? "border-slate-800 bg-slate-900 text-white shadow-md"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-white"
                              }`}
                          >
                            <span className="text-2xl">🖥️</span>
                            <span className="text-base font-semibold">Asset</span>
                            <span className={`text-[13px] leading-tight ${isAsset ? "text-slate-300" : "text-slate-400"}`}>
                              Hardware or device
                            </span>
                            {isAsset && (
                              <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                              </span>
                            )}
                          </button>

                          {/* Service Toggle */}
                          <button
                            type="button"
                            onClick={() => form.setValue("isService", !isService)}
                            className={`relative flex flex-col items-start gap-2 p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
                              ${isService
                                ? "border-slate-800 bg-slate-900 text-white shadow-md"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-white"
                              }`}
                          >
                            <span className="text-2xl">🔧</span>
                            <span className="text-base font-semibold">Service</span>
                            <span className={`text-[13px] leading-tight ${isService ? "text-slate-300" : "text-slate-400"}`}>
                              Software or access
                            </span>
                            {isService && (
                              <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                              </span>
                            )}
                          </button>
                        </div>

                        {!isAsset && !isService && (
                          <p className="text-sm text-rose-500 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                            Select at least one request type
                          </p>
                        )}

                        {/* Asset Description */}
                        {isAsset && (
                          <FormField
                            control={form.control}
                            name="assetDescription"
                            rules={{ required: isAsset ? "Asset description is required" : false }}
                            render={({ field }) => (
                              <FormItem className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <FormLabel className="text-sm font-semibold text-slate-700">
                                  Asset Description <span className="text-rose-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="resize-none h-32 bg-white border-slate-200 rounded-xl text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-300 transition-colors p-3"
                                    placeholder="Describe the required asset..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-sm" />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Service Description */}
                        {isService && (
                          <FormField
                            control={form.control}
                            name="serviceDescription"
                            rules={{ required: isService ? "Service description is required" : false }}
                            render={({ field }) => (
                              <FormItem className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <FormLabel className="text-sm font-semibold text-slate-700">
                                  Service Description <span className="text-rose-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="resize-none h-32 bg-white border-slate-200 rounded-xl text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-300 transition-colors p-3"
                                    placeholder="Describe the service request..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-sm" />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="border-t border-slate-200 pt-5" />
                      </div>
                    ) : (
                      <div className="space-y-1 pb-3 border-b border-slate-200">
                        <h2 className="text-base font-bold text-slate-800">Attachment</h2>
                        <p className="text-sm text-slate-500">Optional supporting image</p>
                      </div>
                    )}

                    {/* Attachment */}
                    <div className="space-y-4">
                      {department === "IT" && (
                        <div className="space-y-1 pb-3">
                          <h2 className="text-base font-bold text-slate-800">Attachment</h2>
                          <p className="text-sm text-slate-500">Optional supporting image</p>
                        </div>
                      )}

                      {!preview ? (
                        <label className="flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-400 cursor-pointer transition-all duration-200 group">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <span className="text-base font-medium text-slate-700 block">Click to upload image</span>
                            <span className="text-sm text-slate-400">PNG, JPG, GIF up to 10MB</span>
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm animate-in fade-in zoom-in-95 duration-300">
                          <img
                            src={preview}
                            className="w-full max-h-56 object-cover"
                            alt="Attachment preview"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <button
                            type="button"
                            onClick={() => { setImage(null); setPreview(null) }}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors text-base font-bold"
                          >
                            ✕
                          </button>
                          <p className="absolute bottom-3 left-4 text-sm text-white/95 font-semibold truncate max-w-[80%]">
                            {image?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <p className="text-sm text-slate-500">
                    Fields marked <span className="text-rose-500 font-bold">*</span> are required
                  </p>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      className="h-12 px-6 text-base text-slate-600 hover:text-slate-900 w-full md:w-auto"
                      onClick={() => { form.reset(); setPreview(null); setImage(null) }}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 px-10 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all duration-200 w-full md:w-auto min-w-[160px]"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-3">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Submitting...
                        </span>
                      ) : "Submit Ticket"}
                    </Button>
                  </div>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}