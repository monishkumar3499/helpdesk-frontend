"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { clearAuthSession } from "@/lib/auth"

// Root page: unconditionally start the app at the login screen
// and wipe any lingering dev sessions so we don't auto-redirect to IT.
export default function Home() {
  const router = useRouter()

  useEffect(() => {
    clearAuthSession() // Wipe existing session to force fresh start
    router.replace("/login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-400 animate-pulse text-sm">Loading Login...</p>
    </div>
  )
}
