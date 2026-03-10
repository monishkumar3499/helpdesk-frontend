"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { clearAuthSession, getAccessToken, getStoredUser } from "@/lib/auth"
import { getSessionInfo, isAnyITRole, isITAdmin, isITSupport } from "./_lib/it-session"

export default function ITLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<{ email: string; role: string }>({ email: "", role: "IT_SUPPORT" })
  const [todayLabel, setTodayLabel] = useState("")
  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    setMounted(true)
    setSessionInfo(getSessionInfo())
    setTodayLabel(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }))

    const storedUser = getStoredUser()
    const token = getAccessToken()
    if (!storedUser || !token) {
      clearAuthSession()
      return router.push("/")
    }
    if (!isAnyITRole(storedUser.role)) {
      clearAuthSession()
      router.push("/")
    }

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

  const navItems = useMemo(() => {
    const common = [
      { href: "/IT", label: "Dashboard" },
      { href: "/IT/tickets", label: "Tickets" },
      { href: "/IT/calendar", label: "Calendar" },
      { href: "/IT/sla", label: "SLA" },
      { href: "/IT/reports", label: "Reports" },
      { href: "/IT/assets", label: "Assets" },
    ]
    if (!isITAdmin(sessionInfo.role)) return common
    return [...common, { href: "/IT/it-support", label: "IT Support" }, { href: "/IT/purchase-assets", label: "Purchase Assets" }]
  }, [sessionInfo.role])

  function isActiveRoute(href: string) {
    if (href === "/IT") return pathname === "/IT"
    return pathname.startsWith(href)
  }

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 bg-slate-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-1">IT Operations</h2>
        <p className="text-xs text-slate-300 mb-5">Helpdesk ticket and asset management</p>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-slate-700 ${isActiveRoute(item.href) ? "bg-slate-800 border border-slate-500" : ""}`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 pt-4 space-y-1">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-medium truncate">{sessionInfo.email || "..."}</p>
          <p className="text-xs text-slate-400">
            Session: <span className="text-emerald-400 font-mono">{formatTime(sessionTime)}</span>
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-slate-800">IT Department Dashboard</h1>
            <Badge className="it-pill bg-slate-100 text-slate-700">
              {isITAdmin(sessionInfo.role) ? "IT Admin" : "IT Support"}
            </Badge>
            {isITSupport(sessionInfo.role) && (
              <Badge className="it-pill border border-blue-200 bg-blue-50 text-blue-700">My Queue Only</Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden md:block">
              {todayLabel}
            </span>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                clearAuthSession()
                router.push("/")
              }}
            >
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto transition-colors duration-300">{children}</main>
      </div>
    </div>
  )
}
