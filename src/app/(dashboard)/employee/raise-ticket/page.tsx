"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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

      const token = localStorage.getItem("authToken")

      const formData = new FormData()

      formData.append("title", values.title)
      formData.append("summary", values.summary)
      formData.append("priority", values.priority)
      formData.append("department", values.department)

      if (values.department === "IT") {
        if (values.isAsset) formData.append("assetDescription", values.assetDescription)
        if (values.isService) formData.append("serviceDescription", values.serviceDescription)
      }

      if (image) {
        formData.append("image", image)
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const res = await fetch(`${baseUrl}/tickets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!res.ok) {
        throw new Error("Ticket creation failed")
      }

      const data = await res.json()

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

    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Raise Ticket
        </h1>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: General Info */}
                <div className="lg:col-span-7 space-y-8">

                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-700">
                          Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 text-base bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200"
                            placeholder="Enter issue title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="priority"
                      rules={{ required: "Priority is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">
                            Priority <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select required onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white text-base transition-all duration-200">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="CRITICAL">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      rules={{ required: "Department is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">
                            Department <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select required onValueChange={(val) => {
                            field.onChange(val)
                            if (val !== "IT") {
                              form.setValue("isAsset", false)
                              form.setValue("isService", false)
                              form.setValue("assetDescription", "")
                              form.setValue("serviceDescription", "")
                            }
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white text-base transition-all duration-200">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HR">HR</SelectItem>
                              <SelectItem value="IT">IT</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="summary"
                    rules={{ required: "Summary is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-700">
                          Summary <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none h-[180px] bg-slate-50 border-slate-200 focus:bg-white text-base transition-all duration-200"
                            placeholder="Describe the issue in detail..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>

                {/* Right Column: IT Details & Attachements */}
                <div className="lg:col-span-5 space-y-8">

                  {department === "IT" && (
                    <div className="space-y-6 p-6 bg-slate-50/80 border border-slate-100 rounded-xl transition-all duration-300">
                      <div className="space-y-4">
                        <FormLabel className="text-base font-semibold text-slate-800 block">
                          Request Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant={isAsset ? "default" : "outline"}
                            onClick={() => form.setValue("isAsset", !isAsset)}
                            className={`h-12 text-sm sm:text-base font-medium transition-all duration-200 ${isAsset ? 'shadow-sm' : 'hover:bg-slate-100 bg-white border-slate-200 text-slate-600'}`}
                          >
                            Asset
                          </Button>
                          <Button
                            type="button"
                            variant={isService ? "default" : "outline"}
                            onClick={() => form.setValue("isService", !isService)}
                            className={`h-12 text-sm sm:text-base font-medium transition-all duration-200 ${isService ? 'shadow-sm' : 'hover:bg-slate-100 bg-white border-slate-200 text-slate-600'}`}
                          >
                            Service
                          </Button>
                        </div>
                        {(!isAsset && !isService) && (
                          <p className="text-[13px] text-red-500 font-medium">Please select at least one request type.</p>
                        )}
                      </div>

                      <div className="space-y-5">
                        {isAsset && (
                          <FormField
                            control={form.control}
                            name="assetDescription"
                            rules={{ required: isAsset ? "Asset description is required" : false }}
                            render={({ field }) => (
                              <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <FormLabel className="text-sm font-semibold text-slate-700">
                                  Asset Description <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="bg-white border-slate-200 resize-none h-24"
                                    placeholder="Provide details about the required asset..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {isService && (
                          <FormField
                            control={form.control}
                            name="serviceDescription"
                            rules={{ required: isService ? "Service description is required" : false }}
                            render={({ field }) => (
                              <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <FormLabel className="text-sm font-semibold text-slate-700">
                                  Service Description <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="bg-white border-slate-200 resize-none h-24"
                                    placeholder="Provide details about the service request..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-6 bg-slate-50/80 border border-slate-100 rounded-xl space-y-4 min-h-[160px]">
                    <FormLabel className="text-base font-semibold text-slate-700 block">Attach Image</FormLabel>
                    <div className="flex flex-col gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        className="file:bg-slate-800 file:text-white file:font-medium file:border-0 file:rounded-md file:px-4 file:py-1.5 file:mr-4 file:hover:bg-slate-700 cursor-pointer h-12 py-2.5 bg-white border-slate-200 transition-all duration-200"
                        onChange={handleImageChange}
                      />
                      {preview && (
                        <div className="relative inline-block mt-2 animate-in fade-in zoom-in-95 duration-300 border border-slate-200 rounded-xl p-2 bg-white shadow-sm">
                          <img
                            src={preview}
                            className="w-full max-h-[220px] object-cover rounded-lg"
                            alt="Attachment preview"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-3 -right-3 rounded-full h-8 w-8 shadow-md border-2 border-white"
                            onClick={() => {
                              setImage(null);
                              setPreview(null);
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              <div className="pt-8 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[220px] h-14 text-lg font-semibold shadow-sm transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}