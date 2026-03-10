"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function LoginPage() {
  const router = useRouter()

  const {
    isAuthenticated,
    user,
    login,
    loading: authLoading
  } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if (authLoading) return

    const token = localStorage.getItem("authToken")

    if (isAuthenticated && user && token) {

      const dest =
        ["HR", "IT_ADMIN", "IT_SUPPORT"].includes(user.role)
          ? "/HR"
          : "/employee"

      router.replace(dest)
    }

  }, [authLoading, isAuthenticated, user, router])


  async function handleLogin() {

    setLoading(true)
    setError("")

    try {

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Invalid email or password")
      }

      if (!data?.access_token || !data?.user) {
        throw new Error("Invalid response from server")
      }

      // Save token + user
      login(data.access_token, data.user)

      // Redirect immediately based on role
      const dest = ['HR', 'IT_ADMIN', 'IT_SUPPORT', 'ADMIN'].includes(data.user.role)
        ? '/HR'
        : '/employee'
      router.replace(dest)

    } catch (err) {

      let errorMessage = "Unable to sign in"

      if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)

    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <p className="text-center mt-10">Checking authentication...</p>
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

      <Card className="w-full max-w-md shadow-lg">

        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Helpdesk Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Backend: {BASE_URL}
          </p>

        </CardContent>

      </Card>

    </div>
  )
}