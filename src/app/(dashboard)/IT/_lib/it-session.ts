export function getCurrentUser(): { email?: string; role?: string; id?: string } | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("user")
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function getSessionInfo() {
  if (typeof window === "undefined") return { email: "", role: "IT" }
  const stored = localStorage.getItem("user")
  if (!stored) return { email: "", role: "IT" }
  try {
    const parsed = JSON.parse(stored)
    return { email: parsed.email || "", role: parsed.role || "IT" }
  } catch {
    return { email: "", role: "IT" }
  }
}
