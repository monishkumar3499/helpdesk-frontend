"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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


export default function RaiseTicketPage() {

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const form = useForm({
    defaultValues: {
      title: "",
      summary: "",
      priority: "",
      department: ""
    }
  })


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0]

    if (!file) return

    setImageFile(file)

    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }

    reader.readAsDataURL(file)
  }


  async function onSubmit(values: any) {

    try {

      setLoading(true)

      const formData = new FormData()

      formData.append("title", values.title)
      formData.append("summary", values.summary)
      formData.append("priority", values.priority)
      formData.append("department", values.department)

      if (imageFile) {
        formData.append("image", imageFile)
      }

      const res = await fetch("http://localhost:3000/tickets", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      console.log("Ticket created:", data)

      alert("Ticket submitted successfully!")

      form.reset()
      setImageFile(null)
      setImagePreview("")

    } catch (error) {

      console.error("Error creating ticket:", error)

    } finally {

      setLoading(false)

    }
  }


  return (

    <div className="max-w-2xl space-y-6">

      <h2 className="text-xl font-semibold">
        Raise Ticket
      </h2>

      <Form {...form}>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >

          {/* Title */}

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter issue title"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />


          {/* Summary */}

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>

                <FormLabel>Summary</FormLabel>

                <FormControl>
                  <Textarea
                    placeholder="Describe the issue"
                    rows={4}
                    {...field}
                  />
                </FormControl>

                <FormMessage />

              </FormItem>
            )}
          />


          {/* Priority */}

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>

                <FormLabel>Priority</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >

                  <FormControl>

                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>

                  </FormControl>

                  <SelectContent>

                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>

                  </SelectContent>

                </Select>

                <FormMessage />

              </FormItem>
            )}
          />


          {/* Department */}

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>

                <FormLabel>Department</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >

                  <FormControl>

                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>

                  </FormControl>

                  <SelectContent>

                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>

                  </SelectContent>

                </Select>

                <FormMessage />

              </FormItem>
            )}
          />


          {/* Image Upload */}

          <FormItem>

            <FormLabel>Attach Image</FormLabel>

            <FormControl>

              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />

            </FormControl>

          </FormItem>


          {/* Image Preview */}

          {imagePreview && (

            <div className="space-y-2">

              <p className="text-sm text-slate-600">
                Preview
              </p>

              <img
                src={imagePreview}
                alt="preview"
                className="max-w-xs rounded-lg border"
              />

            </div>

          )}


          {/* Submit Button */}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>

        </form>

      </Form>

    </div>
  )
}