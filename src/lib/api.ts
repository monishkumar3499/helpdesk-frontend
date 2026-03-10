const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const ACCESS_TOKEN_KEY = "access_token";

export function toArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (
    payload
    && typeof payload === "object"
    && "data" in payload
    && Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const headers = new Headers(options?.headers ?? {});
  if (options?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    const message = text || `API error: ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}
