"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Mail, ShieldCheck } from "lucide-react"

type Role = "EMPLOYEE" | "HR" | "IT_SUPPORT" | "IT_ADMIN"
type Employee = {
  id: string; name: string; email: string
  role: Role; isActive: boolean; createdAt: string
}

const roleColors: Record<Role, string> = {
  EMPLOYEE: "bg-blue-100 text-blue-700 border-blue-200",
  HR: "bg-purple-100 text-purple-700 border-purple-200",
  IT_SUPPORT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  IT_ADMIN: "bg-teal-100 text-teal-700 border-teal-200",
}

const MOCK: Employee[] = [
  { id: "1", name: "Arman singh", email: "aarav@company.com", role: "EMPLOYEE", isActive: true, createdAt: "2024-01-15" },
  { id: "2", name: "Priya Nair", email: "priya@company.com", role: "HR", isActive: true, createdAt: "2023-11-20" },
  { id: "3", name: "Rohan Mehta", email: "rohan@company.com", role: "IT_SUPPORT", isActive: true, createdAt: "2024-02-10" },
  { id: "4", name: "Sneha Pillai", email: "sneha@company.com", role: "EMPLOYEE", isActive: false, createdAt: "2023-09-05" },
  { id: "5", name: "Kiran Raj", email: "kiran@company.com", role: "EMPLOYEE", isActive: true, createdAt: "2024-03-01" },
  { id: "6", name: "Divya Krishnan", email: "divya@company.com", role: "IT_ADMIN", isActive: true, createdAt: "2023-07-18" },
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [selected, setSelected] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    apiFetch("/users")
      .then((res) => {
        setEmployees(res.data)
        setUsingMock(false)
      })
      .catch(() => {
        setEmployees(MOCK)
        setUsingMock(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "All" || e.role === roleFilter
    return matchSearch && matchRole
  })

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
        <p className="text-sm text-slate-500 mt-1">
          {employees.length} total · {employees.filter(e => e.isActive).length} active
          {usingMock && <span className="ml-2 text-orange-500">(Demo data — backend offline)</span>}
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search name or email..." className="pl-9"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select onValueChange={setRoleFilter} defaultValue="All">
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="IT_SUPPORT">IT Support</SelectItem>
            <SelectItem value="IT_ADMIN">IT Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No employees found</p>
          <p className="text-sm mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <Card key={emp.id}
              className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setSelected(emp)}>
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-12">
                  <AvatarFallback className="bg-slate-700 text-white font-semibold text-sm">
                    {initials(emp.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{emp.name}</p>
                  <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[emp.role]}`}>
                      {emp.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${emp.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Employee Profile</DialogTitle></DialogHeader>
            <div className="flex flex-col items-center gap-3 pt-2">
              <Avatar className="h-25 w-25">
                {/* <AvatarImage src={`https://i.pravatar.cc/150?u=${selected.email}`} /> */}
                {/* {initials(selected.name)} */}
                <AvatarFallback className="bg-slate-700 text-white text-xl font-bold">
                  {initials(selected.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-bold">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Role</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${roleColors[selected.role]}`}>{selected.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Mail className="h-4 w-4" /> Status</span>
                <span className={`font-medium ${selected.isActive ? "text-green-600" : "text-red-500"}`}>
                  {selected.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Employee ID</span>
                <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded">
                  {selected.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Joined</span>
                <span className="font-medium">
                  {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
