"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

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
  assetDescription?: string
  serviceDescription?: string
}

export default function RaiseTicketPage() {

  const [loading,setLoading] = useState(false)
  const [image,setImage] = useState<File | null>(null)
  const [preview,setPreview] = useState<string | null>(null)
  const [selectedOptions,setSelectedOptions] = useState<string[]>([])

  const form = useForm<FormValues>({
    defaultValues:{
      title:"",
      summary:"",
      priority:"LOW",
      department:"HR"
    }
  })

  function handleImageChange(e:React.ChangeEvent<HTMLInputElement>){

    const file = e.target.files?.[0]
    if(!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  function toggleOption(option:string){

    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev,option]
    )
  }

  async function onSubmit(values:FormValues){

    if(selectedOptions.includes("ASSET") && !values.assetDescription){
      form.setError("assetDescription",{message:"Asset description required"})
      return
    }

    if(selectedOptions.includes("SERVICE") && !values.serviceDescription){
      form.setError("serviceDescription",{message:"Service description required"})
      return
    }

    try{

      setLoading(true)

      const formData = new FormData()

      formData.append("title",values.title)
      formData.append("summary",values.summary)
      formData.append("priority",values.priority)
      formData.append("department",values.department)

      formData.append("assetDescription",values.assetDescription || "")
      formData.append("serviceDescription",values.serviceDescription || "")

      formData.append("createdById","101")

      if(image){
        formData.append("image",image)
      }

      const res = await fetch("http://localhost:3001/tickets",{
        method:"POST",
        body:formData
      })

      if(!res.ok){
        throw new Error("Ticket creation failed")
      }

      const data = await res.json()

      toast.success("Ticket submitted successfully!",{
        description:`Ticket #${data.ticketNumber} created`
      })

      form.reset()
      setPreview(null)
      setImage(null)
      setSelectedOptions([])

    }catch(error){

      toast.error("Ticket submission failed")

      console.error(error)

    }finally{

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
          className="space-y-5"
        >

          {/* Title */}

          <FormField
            control={form.control}
            name="title"
            rules={{ required:"Title is required" }}
            render={({field})=>(
              <FormItem>

                <FormLabel>
                  Title <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input placeholder="Enter issue title" {...field}/>
                </FormControl>

                <FormMessage/>

              </FormItem>
            )}
          />

          {/* Summary */}

          <FormField
            control={form.control}
            name="summary"
            rules={{ required:"Summary is required" }}
            render={({field})=>(
              <FormItem>

                <FormLabel>
                  Summary <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Textarea rows={4} placeholder="Describe the issue" {...field}/>
                </FormControl>

                <FormMessage/>

              </FormItem>
            )}
          />

          {/* Priority */}

          <FormField
            control={form.control}
            name="priority"
            rules={{ required:"Priority is required" }}
            render={({field})=>(
              <FormItem>

                <FormLabel>
                  Priority <span className="text-red-500">*</span>
                </FormLabel>

                <Select onValueChange={field.onChange} value={field.value}>

                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority"/>
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>

                </Select>

                <FormMessage/>

              </FormItem>
            )}
          />

          {/* Department */}

          <FormField
            control={form.control}
            name="department"
            rules={{ required:"Department required" }}
            render={({field})=>(
              <FormItem>

                <FormLabel>
                  Department <span className="text-red-500">*</span>
                </FormLabel>

                <Select onValueChange={field.onChange} value={field.value}>

                  <FormControl>
                    <SelectTrigger>
                      <SelectValue/>
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>

                </Select>

                <FormMessage/>

              </FormItem>
            )}
          />

          {/* IT Options */}

          {form.watch("department") === "IT" && (

            <div className="space-y-2">

              <FormLabel>IT Request Type</FormLabel>

              <div className="flex gap-6">

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes("ASSET")}
                    onChange={()=>toggleOption("ASSET")}
                  />
                  Asset
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes("SERVICE")}
                    onChange={()=>toggleOption("SERVICE")}
                  />
                  Service
                </label>

              </div>

            </div>

          )}

          {/* Asset Description */}

          {selectedOptions.includes("ASSET") && (

            <FormField
              control={form.control}
              name="assetDescription"
              render={({field})=>(
                <FormItem>

                  <FormLabel>
                    Asset Description <span className="text-red-500">*</span>
                  </FormLabel>

                  <FormControl>
                    <Textarea {...field}/>
                  </FormControl>

                  <FormMessage/>

                </FormItem>
              )}
            />

          )}

          {/* Service Description */}

          {selectedOptions.includes("SERVICE") && (

            <FormField
              control={form.control}
              name="serviceDescription"
              render={({field})=>(
                <FormItem>

                  <FormLabel>
                    Service Description <span className="text-red-500">*</span>
                  </FormLabel>

                  <FormControl>
                    <Textarea {...field}/>
                  </FormControl>

                  <FormMessage/>

                </FormItem>
              )}
            />

          )}

          {/* Image Upload */}

          <div className="space-y-2">

            <FormLabel>Attach Image</FormLabel>

            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {preview && (
              <img
                src={preview}
                className="w-40 h-40 object-cover rounded border"
              />
            )}

          </div>

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