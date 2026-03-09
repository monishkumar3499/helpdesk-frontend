"use client"

import { useEffect, useState } from "react"

import { DataTable } from "@/components/ui/data-table"
import { columns, Ticket } from "./columns"

export default function MyTicketsPage() {

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function fetchTickets() {

      try {

        const res = await fetch("http://localhost:3000/tickets")

        const data = await res.json()

        setTickets(data)

      } catch (error) {

        console.error("Failed to fetch tickets:", error)

      } finally {

        setLoading(false)

      }

    }

    fetchTickets()

  }, [])


  if (loading) {
    return <p className="p-6 text-gray-500">Loading tickets...</p>
  }


  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        My Tickets
      </h1>

      <DataTable
        columns={columns}
        data={tickets}
      />

    </div>

  )

}