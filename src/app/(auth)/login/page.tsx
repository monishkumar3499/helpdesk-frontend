"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { setAuthSession } from "@/lib/auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Role → dashboard route mapping
function getDashboardRoute(role: string): string {
  if (role === "IT_ADMIN" || role === "IT_SUPPORT") return "/IT"
  if (role === "HR") return "/HR"
  if (role === "ADMIN") return "/HR"
  return "/employee"
}

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, user, login, loading: authLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Already authenticated → redirect to dashboard
  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated && user) {
      router.replace(getDashboardRoute(user.role))
    }
  }, [authLoading, isAuthenticated, user, router])

  async function handleLogin() {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Invalid email or password")
      }

      if (!data?.access_token || !data?.user) {
        throw new Error("Invalid response from server")
      }

      // ── Write to auth-context (HR / Employee dashboards) ───────────────────
      login(data.access_token, data.user)

      // ── Also write to auth.ts helpers (IT dashboard) ───────────────────────
      setAuthSession(
        { id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role },
        data.access_token
      )

      // ── Route by role ──────────────────────────────────────────────────────
      router.replace(getDashboardRoute(data.user.role))

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 animate-pulse">Checking session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center text-2xl">
            🎫
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Helpdesk Portal</CardTitle>
          <CardDescription className="text-slate-500">Sign in to access your dashboard</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-11"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Button
            className="w-full h-11 text-base font-semibold bg-sky-700 hover:bg-sky-600"
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="border-t pt-3 space-y-1 text-xs text-slate-400 text-center">
            <p className="font-medium text-slate-500">Demo accounts</p>
            <p>HR: <code>hr@helpdesk.com</code> / hr@123</p>
            <p>IT Admin: <code>itadmin@helpdesk.com</code> / it@123</p>
            <p>IT Support: <code>it@helpdesk.com</code> / it@123</p>
            <p>Employee: <code>john@company.com</code> / emp@123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
