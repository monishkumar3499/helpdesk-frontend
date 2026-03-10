"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { clearAuthSession, getAccessToken, getStoredUser } from "@/lib/auth"

export default function HrLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    const user = getStoredUser()
    const token = getAccessToken()
    if (user?.email && token && user.role === "HR") {
      setEmail(user.email)
    } else {
      clearAuthSession()
      router.push("/")
      return
    }

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
    clearAuthSession()
    router.push("/")
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">HR Dashboard</h2>

        <nav className="space-y-2 flex-1">
          <Button asChild variant="ghost" className="w-full justify-start text-white hover:bg-slate-700">
            <Link href="/HR">
               Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start text-white hover:bg-slate-700">
            <Link href="/HR/Tickets">
               Tickets
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start text-white hover:bg-slate-700">
            <Link href="/HR/employees">
               Employees
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start text-white hover:bg-slate-700">
            <Link href="/HR/Calendar">
               Calendar
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start text-white hover:bg-slate-700">
            <Link href="/HR/SLA">
              SLA
            </Link>
          </Button>
          {/* <Link href="/HR/Reports">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-700">
              Reports
            </Button>
          </Link> */}
        </nav>

        {/* Session info at bottom of sidebar */}
        <div className="border-t border-slate-700 pt-4 mt-4 space-y-1">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm text-white font-medium truncate">{email || "..."}</p>
          <p className="text-xs text-slate-400">
            Session: <span className="text-green-400 font-mono">{formatTime(sessionTime)}</span>
          </p>
        </div>
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="h-14 border-b flex items-center px-6 justify-between bg-white">
          <h1 className="font-semibold text-slate-800">HR Management System</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden md:block">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
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

        {/* Page Content call*/}
        <main className="flex-1 p-6 bg-slate-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
