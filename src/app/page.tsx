"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

const MOCK_USERS = [
  { id: "u-hr-1", email: "hr@company.com", password: "password123", role: "HR", name: "HR Manager" },
  { id: "it-admin-1", email: "it.admin@company.com", password: "password123", role: "IT_ADMIN", name: "IT Admin Lead" },
  { id: "it-2", email: "ravi.it@company.com", password: "password123", role: "IT_SUPPORT", name: "Ravi IT" },
  { id: "emp-1", email: "employee@company.com", password: "password123", role: "EMPLOYEE", name: "Test Employee" },
]

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
    const user = localStorage.getItem("user")
    if (!user) return

    const parsed = JSON.parse(user)
    if (parsed.role === "HR") router.push("/HR")
    else if (["IT_SUPPORT", "IT_ADMIN"].includes(parsed.role)) router.push("/IT")
    else router.push("/employee")
  }, [router])

  function handleLogin() {
    setLoading(true)
    setError("")

    setTimeout(() => {
      const user = MOCK_USERS.find(
        (item) => item.email === email && item.password === password && item.role === selectedRole,
      )

      if (!user) {
        setError("Invalid email, password, or role")
        setLoading(false)
        return
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: user.email,
          id: user.id,
          name: user.name,
          role: normalizeRole(user.role),
          loginTime: new Date().toISOString(),
        }),
      )

      if (user.role === "HR") {
        router.push("/HR")
      } else if (["IT_ADMIN", "IT_SUPPORT"].includes(user.role)) {
        router.push("/IT")
      } else {
        router.push("/employee")
      }

      setLoading(false)
    }, 800)
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
            <p className="text-xs text-blue-600">HR: hr@company.com | password123</p>
            <p className="text-xs text-blue-600">IT Admin: it.admin@company.com | password123</p>
            <p className="text-xs text-blue-600">IT Support: ravi.it@company.com | password123</p>
            <p className="text-xs text-blue-600">Employee: employee@company.com | password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
