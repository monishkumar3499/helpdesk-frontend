"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { clearAuthSession, getStoredUser, setAuthSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type LoginResponse = {
  access_token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

function normalizeRole(role: string) {
  if (role === "IT_ADMIN") return "IT_ADMIN"
  if (role === "IT_SUPPORT") return "IT_SUPPORT"
  return role
}

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser?.role) return

    if (storedUser.role === "HR") router.push("/HR")
    else if (["IT_SUPPORT", "IT_ADMIN"].includes(storedUser.role)) router.push("/IT")
    else router.push("/employee")
  }, [router])

  async function handleLogin() {
    setLoading(true)
    setError("")

    try {
      const response = await apiFetch(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        { forceBackend: true },
      )
      const data = response as LoginResponse
      const backendRole = normalizeRole(data.user.role)

      if (selectedRole && backendRole !== selectedRole) {
        clearAuthSession()
        setError("Selected role does not match this account")
        return
      }

      setAuthSession(
        {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: backendRole,
          loginTime: new Date().toISOString(),
        },
        data.access_token,
      )

      if (backendRole === "HR") {
        router.push("/HR")
      } else if (["IT_ADMIN", "IT_SUPPORT"].includes(backendRole)) {
        router.push("/IT")
      } else {
        router.push("/employee")
      }
    } catch {
      clearAuthSession()
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

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
          <div className="space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full">Select Role</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={() => setShowText(true)}>
                {["HR", "IT_ADMIN", "IT_SUPPORT", "EMPLOYEE"].map((role) => (
                  <DropdownMenuCheckboxItem
                    key={role}
                    checked={selectedRole === role}
                    onCheckedChange={() => setSelectedRole(role)}
                  >
                    {role}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {showText && <p className="text-sm text-slate-600">You selected: {selectedRole || "No role"}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="hr@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="........"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <Button
            className="w-full bg-slate-800 hover:bg-slate-700 h-11"
            onClick={handleLogin}
            disabled={loading || !email || !password || !selectedRole}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-1">Credentials for testing:</p>
            <p className="text-xs text-blue-600">HR: meera.hr@company.com | Hr123!</p>
            <p className="text-xs text-blue-600">IT Admin: admin@company.com | Admin123!</p>
            <p className="text-xs text-blue-600">IT Support: ravi.support@company.com | Support123!</p>
            <p className="text-xs text-blue-600">Employee: john.employee@company.com | Employee123!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
