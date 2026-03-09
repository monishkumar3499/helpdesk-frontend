"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"



export default function HrLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [sessionTime, setSessionTime] = useState(0)
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    // Get user from localStorage
    const stored = localStorage.getItem("user")

    if (stored) {
      const user = JSON.parse(stored)
      setEmail(user.email)
    } else {
      router.push("/login")
    }

    // Set current date (fix hydration issue)
    setCurrentDate(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    )

    // Start session timer
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  function handleLogout() {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Employee Dashboard</h2>

        <nav className="space-y-2 flex-1">
          <Link href="/employee">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-700"
            >
              Dashboard
            </Button>
          </Link>

          <Link href="/employee/raise-ticket">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-700"
            >
              Raise Ticket
            </Button>
          </Link>

          <Link href="/employee/my-tickets">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-700"
            >
              My Tickets
            </Button>
          </Link>

          <Link href="/employee/calendar">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-700"
            >
              Calendar
            </Button>
          </Link>
        </nav>

        {/* Session Info */}
        <div className="border-t border-slate-700 pt-4 mt-4 space-y-1">
          <p className="text-xs text-slate-400">Logged in as</p>

          <p className="text-sm text-white font-medium truncate">
            {email || "..."}
          </p>

          <p className="text-xs text-slate-400">
            Session:
            <span className="text-green-400 font-mono ml-1">
              {formatTime(sessionTime)}
            </span>
          </p>
        </div>
      </aside>


      {/* Main Section */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <header className="h-14 border-b flex items-center px-6 justify-between bg-white">
          <h1 className="font-semibold text-slate-800">
            Employee Management System
          </h1>

          <div className="flex items-center gap-4">

            {/* Date (hydration safe) */}
            <span className="text-sm text-slate-500 hidden md:block">
              {currentDate}
            </span>

            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-slate-50 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  )
}