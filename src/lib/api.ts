const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Universal API fetch helper
 * - Injects JWT token automatically
 * - Handles API errors
 * - Redirects to login if token expired
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {

  const url = `${BASE_URL}${endpoint}`;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("📡 API REQUEST:", url);

  try {

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log("📡 STATUS:", response.status);

    // Unauthorized
    if (response.status === 401) {

      console.warn("🔒 Token expired");

      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");   // FIXED KEY
        window.location.href = "/login";
      }

      throw new ApiError(401, "Unauthorized", "Session expired");
    }

    // Forbidden
    if (response.status === 403) {
      throw new ApiError(
        403,
        "Forbidden",
        "You don't have permission to access this resource"
      );
    }

    // Handle other errors
    if (!response.ok) {

      let errorData: ApiErrorResponse | null = null;

      try {
        errorData = await response.json();
      } catch {}

      throw new ApiError(
        response.status,
        errorData?.message || `HTTP ${response.status}`,
        errorData?.error || response.statusText
      );
    }

    // Safely parse JSON
    const text = await response.text();

    const data = text ? JSON.parse(text) : null;

    console.log("✅ RESPONSE:", data);

    return data;

  } catch (error) {

    console.error("❌ API ERROR:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        "Network Error",
        `Cannot connect to backend at ${BASE_URL}`
      );
    }

    throw error;
  }
}