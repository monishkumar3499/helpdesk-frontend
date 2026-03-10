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
      department: "IT",
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

    <div className="max-w-3xl mx-auto py-8">
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-800">
            Raise Ticket
          </CardTitle>
          <CardDescription>
            Submit an issue or request to the HR or IT department.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >

              <FormField
                control={form.control}
                name="title"
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <FormItem>

                    <FormLabel>Title</FormLabel>

                    <FormControl>
                      <Input placeholder="Enter issue title" {...field} />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                rules={{ required: "Summary is required" }}
                render={({ field }) => (
                  <FormItem>

                    <FormLabel>Summary</FormLabel>

                    <FormControl>
                      <Textarea rows={4} placeholder="Describe the issue" {...field} />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={(val) => {
                        field.onChange(val)
                        if (val !== "IT") {
                          form.setValue("isAsset", false)
                          form.setValue("isService", false)
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {department === "IT" && (
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <FormLabel className="text-slate-700">Request Type</FormLabel>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={isAsset ? "default" : "outline"}
                      onClick={() => form.setValue("isAsset", !isAsset)}
                      className="flex-1"
                    >
                      Asset
                    </Button>
                    <Button
                      type="button"
                      variant={isService ? "default" : "outline"}
                      onClick={() => form.setValue("isService", !isService)}
                      className="flex-1"
                    >
                      Service
                    </Button>
                  </div>

                  {isAsset && (
                    <FormField
                      control={form.control}
                      name="assetDescription"
                      rules={{ required: isAsset ? "Asset description is required" : false }}
                      render={({ field }) => (
                        <FormItem className="pt-2">
                          <FormLabel>Asset Description</FormLabel>
                          <FormControl>
                            <Textarea rows={3} placeholder="Please provide details about the asset..." {...field} />
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
                        <FormItem className="pt-2">
                          <FormLabel>Service Description</FormLabel>
                          <FormControl>
                            <Textarea rows={3} placeholder="Please provide details about the service request..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <FormLabel>Attach Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  className="file:bg-slate-100 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:hover:bg-slate-200 cursor-pointer"
                  onChange={handleImageChange}
                />
                {preview && (
                  <img
                    src={preview}
                    className="w-40 h-40 object-cover rounded shadow-sm border border-slate-200"
                    alt="Attachment preview"
                  />
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>

  )

}