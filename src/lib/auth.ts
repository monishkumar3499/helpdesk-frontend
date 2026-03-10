// lib/auth.ts — Unified auth session helpers used by all dashboards

// ─── Single source-of-truth storage keys ─────────────────────────────────────
// Both the IT dashboard and the HR/Employee dashboard must use these same keys
export const AUTH_USER_KEY = "authUser";
export const AUTH_TOKEN_KEY = "authToken";

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  loginTime?: string;
};

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  // Primary key
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (raw) {
    try { return JSON.parse(raw) as AuthUser; } catch { /* fall through */ }
  }
  return null;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthSession(user: AuthUser, accessToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  // Clear both old key names (IT dashboard used "user"/"access_token")
  // and new unified keys so nothing is left behind
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
}
