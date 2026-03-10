"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { columns, Ticket } from "./columns"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

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

  useEffect(() => {

    if (authLoading) return

    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    fetchTickets()

  }, [authLoading, isAuthenticated])

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

      toast.success("Ticket updated successfully!")
      setOpen(false)
      fetchTickets()

    }catch(err: any){

      console.error("Update failed:",err)
      toast.error(err.message || "Failed to update ticket.")

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

  return(

    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        My Tickets
      </h1>

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