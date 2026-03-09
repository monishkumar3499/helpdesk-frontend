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
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("user")
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function getSessionInfo() {
  if (typeof window === "undefined") return { email: "", role: "IT_SUPPORT" }
  const stored = localStorage.getItem("user")
  if (!stored) return { email: "", role: "IT_SUPPORT" }
  try {
    const parsed = JSON.parse(stored)
    return { email: parsed.email || "", role: normalizeITRole(parsed.role) }
  } catch {
    return { email: "", role: "IT_SUPPORT" }
  }
}
