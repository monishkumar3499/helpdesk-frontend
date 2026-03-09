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

type FormValues = {
  title: string
  summary: string
  priority: "LOW" | "HIGH" | "CRITICAL"
  department: "HR" | "IT"
}

export default function RaiseTicketPage() {

  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      summary: "",
      priority: "LOW",
      department: "IT"
    }
  })

  async function onSubmit(values: FormValues) {

    try {

      setLoading(true)

      const payload = {
        ...values,

        // TEMP user id (later replace with auth user)
        createdById: "test-user-id"
      }

      const res = await fetch("http://localhost:3000/tickets", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      })

      const data = await res.json()

      console.log("Ticket created:", data)

      alert("Ticket submitted successfully!")

      form.reset()

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