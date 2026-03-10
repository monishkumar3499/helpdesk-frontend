"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        const dest = ["HR", "IT_ADMIN", "IT_SUPPORT"].includes(user.role) ? "/HR" : "/employee"
        router.replace(dest)
      } else {
        router.replace("/login")
      }
    }
  }, [loading, isAuthenticated, user, router])

  return null
}