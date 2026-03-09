"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSessionInfo } from "./_lib/it-session"

export default function ITLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sessionInfo] = useState(getSessionInfo)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) return router.push("/")
    const parsed = JSON.parse(stored)
    if (!["IT", "ADMIN"].includes(parsed.role)) router.push("/")
  }, [router])

  const navItems = useMemo(() => {
    const common = [
      { href: "/IT", label: "Dashboard" },
      { href: "/IT/assigned", label: "Assigned Tickets" },
      { href: "/IT/accepted", label: "Accepted Tickets" },
      { href: "/IT/resolved", label: "Resolved Tickets" },
      { href: "/IT/assets", label: "Assets" },
    ]
    return sessionInfo.role === "ADMIN"
      ? [{ href: "/IT/all-tickets", label: "All Tickets" }, ...common, { href: "/IT/purchase-assets", label: "Purchase Assets" }]
      : common
  }, [sessionInfo.role])

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 bg-slate-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-1">IT Operations</h2>
        <p className="text-xs text-slate-300 mb-5">Helpdesk ticket and asset management</p>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className={`w-full justify-start text-white hover:bg-slate-700 ${pathname === item.href ? "bg-slate-700" : ""}`}>{item.label}</Button>
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 pt-4 space-y-1">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-medium truncate">{sessionInfo.email || "..."}</p>
          <p className="text-xs text-slate-400">Role: {sessionInfo.role || "IT"}</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-6 bg-white">
          <h1 className="font-semibold text-slate-800">IT Department Dashboard</h1>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { localStorage.removeItem("user"); router.push("/") }}>Logout</Button>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
