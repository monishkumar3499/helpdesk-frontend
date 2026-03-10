import { getStoredUser } from "@/lib/auth"

export type ITAccessRole = "IT_ADMIN" | "IT_SUPPORT"

export function normalizeITRole(role?: string): ITAccessRole {
  if (role === "IT_ADMIN") return "IT_ADMIN"
  return "IT_SUPPORT"
}

export function isITAdmin(role?: string): boolean {
  return normalizeITRole(role) === "IT_ADMIN"
}

export function isITSupport(role?: string): boolean {
  return normalizeITRole(role) === "IT_SUPPORT"
}

export function isAnyITRole(role?: string): boolean {
  return ["IT_SUPPORT", "IT_ADMIN"].includes(role || "")
}

export function getCurrentUser(): { email?: string; role?: string; id?: string } | null {
  return getStoredUser()
}

export function getSessionInfo() {
  const user = getStoredUser()
  if (!user) return { email: "", role: "IT_SUPPORT" }
  return { email: user.email || "", role: normalizeITRole(user.role) }
}
