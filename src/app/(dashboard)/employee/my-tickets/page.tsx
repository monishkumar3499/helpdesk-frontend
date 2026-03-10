"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { columns, Ticket } from "./columns"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

export default function MyTicketsPage() {

  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [tickets,setTickets] = useState<Ticket[]>([])
  const [loading,setLoading] = useState(true)

  const [open,setOpen] = useState(false)
  const [selected,setSelected] = useState<Ticket | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {

    if (authLoading) return

    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    fetchTickets()

  }, [authLoading, isAuthenticated, router])

  async function fetchTickets(){

    try{

      const data = await apiFetch("/tickets/mine")
      setTickets(data)

    }catch(err){

      console.error("Failed to fetch tickets:",err)

    }finally{

      setLoading(false)

    }

  }

  function handleRowClick(ticket:Ticket){
    setSelected({...ticket})
    setOpen(true)
  }

  async function saveChanges(){

    if(!selected) return

    try{
      setIsUpdating(true)
      await apiFetch(`/tickets/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title:selected.title,
          summary:selected.summary,
          status:selected.status,
          priority:selected.priority,
          department:selected.department
        })
      })

      setFeedback("Ticket updated successfully")
      setOpen(false)
      fetchTickets()

    }catch(err: unknown){

      console.error("Update failed:",err)
      setFeedback(err instanceof Error ? err.message : "Failed to update ticket")

    }finally{
      setIsUpdating(false)
    }

  }

  if(authLoading){
    return <p className="p-6 text-gray-500">Checking authentication...</p>
  }

  if(loading){
    return <p className="p-6 text-gray-500">Loading tickets...</p>
  }

  const formatIssueType = (issueType?: Ticket["issueType"]) =>
    (issueType || "GENERAL").replaceAll("_", " ")

  return(

    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        My Tickets
      </h1>

      {feedback && (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {feedback}
        </p>
      )}

      <DataTable
        columns={columns}
        data={tickets}
        onRowClick={handleRowClick}
      />

      <Dialog open={open} onOpenChange={setOpen}>

        <DialogContent className="max-w-lg">

          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
          </DialogHeader>

          {selected && (

            <div className="space-y-5">

              <div className="space-y-1">
                <Label>Title</Label>
                <Input
                  value={selected.title}
                  onChange={(e)=>
                    setSelected({...selected,title:e.target.value})
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Summary</Label>
                <Input
                  value={selected.summary || ""}
                  onChange={(e)=>
                    setSelected({...selected,summary:e.target.value})
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Status</Label>

                <Select
                  value={selected.status}
                  onValueChange={(value)=>
                    setSelected({...selected,status:value as Ticket["status"]})
                  }
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="OPEN">OPEN</SelectItem>
                    <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                    <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  </SelectContent>

                </Select>
              </div>

              <div className="space-y-1">
                <Label>Priority</Label>

                <Select
                  value={selected.priority}
                  onValueChange={(value)=>
                    setSelected({...selected,priority:value as Ticket["priority"]})
                  }
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="LOW">LOW</SelectItem>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                  </SelectContent>

                </Select>

              </div>

              <div className="space-y-1">
                <Label>Department</Label>

                <Select
                  value={selected.department}
                  onValueChange={(value)=>
                    setSelected({...selected,department:value as Ticket["department"]})
                  }
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>

                </Select>

              </div>

              {selected.department === "IT" && (
                <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="space-y-1">
                    <Label>IT Issue Type</Label>
                    <p className="text-sm font-medium text-slate-800">{formatIssueType(selected.issueType)}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                    <div>
                      <p className="text-xs text-slate-500">Asset Serial Number</p>
                      <p className="font-medium">{selected.assetIssue?.assetSerialNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Asset Category</p>
                      <p className="font-medium">{selected.assetIssue?.assetCategory || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Classification</p>
                      <p className="font-medium">{selected.assetIssue?.assetClassification || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Requested Asset / Problem</p>
                      <p className="font-medium">{selected.assetIssue?.requestedAssetName || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500 pt-2 border-t space-y-1">

                <p>
                  Created By: {selected.createdBy?.name}
                </p>

                <p>
                  Created At: {new Date(selected.createdAt).toLocaleString()}
                </p>

              </div>

              <DialogFooter className="pt-3">

                <Button
                  variant="outline"
                  onClick={()=>setOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  onClick={saveChanges}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>

              </DialogFooter>

            </div>

          )}

        </DialogContent>

      </Dialog>

    </div>

  )

}