"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { apiFetch } from "@/lib/api" // Adjust the path to where your apiFetch is located

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [Showtext, setShowtext] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      if (parsed.role === "HR" || parsed.role === "ADMIN") router.push("/HR")
      else router.push("/employee")
    }
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError("")

    try {
      const response = await apiFetch("/auth/login", { // Update to the correct login endpoint
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          role: selectedRole, // Optional: Send role if needed
        }),
      });

      // Extract token and user information
      const { access_token, user } = response;

      // Save to localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        id: user.id,
        loginTime: new Date().toISOString(),
      }));

      // Redirect based on role
      if (user.role === "HR" || user.role === "ADMIN") {
        router.push("/HR");
      } else {
        router.push("/employee");
      }
    } catch (error) {
      setError("Invalid email, password, or role");
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
          <center>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button className="w-full">Select Role</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={() => setShowtext(true)}>
                {["HR", "ADMIN", "EMPLOYEE"].map(role => (
                  <DropdownMenuCheckboxItem
                    key={role}
                    checked={selectedRole === role}
                    onCheckedChange={() => setSelectedRole(role)}> 
                    {role}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {Showtext && (
              <p className="text-sm">You Selected: {selectedRole}</p>
            )}
          </center>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="hr@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

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

          {/* Test credentials hint */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-1">Credentials for testing:</p>
            <p className="text-xs text-blue-600">HR: avi@company.com | avi@1234</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
