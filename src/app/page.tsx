"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getStoredUser } from "@/lib/auth"

// Root page: redirect to the correct dashboard based on role
// Falls back to /login if no session exists
export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (isAuthenticated && user) {
      // auth-context session exists
      const role = user.role
      if (role === "IT_ADMIN" || role === "IT_SUPPORT") return void router.replace("/IT")
      if (role === "HR") return void router.replace("/HR")
      return void router.replace("/employee")
    }

    // Fallback: check IT dashboard's auth.ts session (in case only that was written)
    const storedUser = getStoredUser()
    if (storedUser?.role) {
      const role = storedUser.role
      if (role === "IT_ADMIN" || role === "IT_SUPPORT") return void router.replace("/IT")
      if (role === "HR" || role === "ADMIN") return void router.replace("/HR")
      return void router.replace("/employee")
    }

    // No session — go to login
    router.replace("/login")
  }, [loading, isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-400 animate-pulse text-sm">Redirecting...</p>
    </div>
  )
}
