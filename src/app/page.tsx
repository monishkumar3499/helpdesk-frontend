"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const parsed = JSON.parse(user)
        if (parsed.role === "HR" || parsed.role === "IT_ADMIN" || parsed.role === "IT_SUPPORT") {
          router.push("/HR")
        } else {
          router.push("/employee")
        }
      } catch {
        localStorage.removeItem("user")
      }
    }
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError("")

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      const { access_token, user } = response

      if (!access_token || !user) {
        setError("Unexpected response from server.")
        return
      }

      //selected role can login
      if (user.role !== selectedRole) {
        setError(`Access denied! This login is for "${selectedRole}" only.`)
        return
      }

      localStorage.setItem("token", access_token)
      localStorage.setItem("user", JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        id: user.id,
        loginTime: new Date().toISOString(),
      }))

      if (user.role === "HR" || user.role === "IT_ADMIN" || user.role === "IT_SUPPORT") {
        router.push("/HR")
      } else {
        router.push("/employee")
      }

    } catch (err: any) {
      setError("Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  const roles = ["HR", "IT_ADMIN", "IT_SUPPORT", "EMPLOYEE"]

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">HD</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Helpdesk Login</CardTitle>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">

          {/* Role Dropdown */}
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between border border-slate-200 rounded-md px-3 py-2 text-sm bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <span className={selectedRole ? "text-slate-800" : "text-slate-400"}>
                  {selectedRole || "Select your role"}
                </span>
                <span className="text-slate-400">{dropdownOpen ? "▴" : "▾"}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                  {roles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role)
                        setDropdownOpen(false)
                        setError("")
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${
                        selectedRole === role ? "text-slate-800 font-semibold bg-slate-50" : "text-slate-600"
                      }`}
                    >
                      {role}
                      {selectedRole === role && <span className="text-green-500 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              ⚠️ {error}
            </p>
          )}

          <Button
            className="w-full bg-slate-800 hover:bg-slate-700 h-11"
            onClick={handleLogin}
            disabled={loading || !email || !password || !selectedRole}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
