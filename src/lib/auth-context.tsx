"use client"

import { useCallback, useEffect, useState } from "react"
import { clearAuthSession, getStoredUser, type AuthUser } from "@/lib/auth"

type UseAuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  logout: () => void
}

export function useAuth(): UseAuthState {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setLoading(false)
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setUser(null)
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    loading,
    logout,
  }
}
