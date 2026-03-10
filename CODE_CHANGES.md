# 🔄 Code Changes - Before & After

## This file shows EXACT code transformations made to your project

---

## 1️⃣ API URL Fix

### BEFORE ❌
```typescript
// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
```

### AFTER ✅
```typescript
// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
```

**Why:** Backend runs on port 3000, not 3001. The old code caused 404 errors on all API calls.

---

## 2️⃣ Enhanced API Helper

### BEFORE ❌
```typescript
// src/lib/api.ts
const BASE_URL = "http://localhost:3001"

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem("token")
  const headers = { "Content-Type": "application/json" }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { ...headers, ...options?.headers },
    ...options,
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
```

### AFTER ✅
```typescript
// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface ApiErrorResponse {
  statusCode: number
  message: string
  error: string
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch(
  endpoint: string,
  options?: RequestInit
): Promise<any> {
  const token = localStorage.getItem('authToken')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Handle 401 - Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      throw new ApiError(401, 'Unauthorized', 'Session expired.')
    }

    // Handle 403 - Forbidden
    if (response.status === 403) {
      throw new ApiError(403, 'Forbidden', 'You do not have permission.')
    }

    // Handle errors
    if (!response.ok) {
      let errorData: ApiErrorResponse | null = null
      try {
        errorData = await response.json()
      } catch { }

      throw new ApiError(
        response.status,
        errorData?.message || `HTTP ${response.status}`,
        errorData?.error || response.statusText
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        'Network Error',
        'Unable to connect to the server at ' + BASE_URL
      )
    }

    throw error
  }
}
```

**What's New:**
- ✅ `ApiError` class for typed errors
- ✅ 401 auto-redirect to login
- ✅ 403 permission denied handling
- ✅ Network error detection
- ✅ Better error messages
- ✅ Token key: `'token'` → `'authToken'`

---

## 3️⃣ App Layout - Add Auth Provider

### BEFORE ❌
```typescript
// src/app/layout.tsx
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          {children}
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  )
}
```

### AFTER ✅
```typescript
// src/app/layout.tsx
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"  // ← NEW
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>  {/* ← NEW */}
          <TooltipProvider>
            {children}
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

**Why:** AuthProvider makes auth state available to all components via `useAuth()` hook.

---

## 4️⃣ Login Page - Better Token Storage

### BEFORE ❌
```typescript
// src/app/(auth)/login/page.tsx
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Token storage
localStorage.setItem("token", data.access_token)
localStorage.setItem("user", JSON.stringify(data.user))
```

### AFTER ✅
```typescript
// src/app/(auth)/login/page.tsx
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Check existing auth
const { isAuthenticated, user } = useAuth()

useEffect(() => {
  if (isAuthenticated && user) {
    if (["HR", "IT_ADMIN", "IT_SUPPORT"].includes(user.role)) {
      router.push("/HR")
    } else {
      router.push("/employee")
    }
  }
}, [isAuthenticated, user, router])

// Token storage with new keys
localStorage.setItem("authToken", data.access_token)
localStorage.setItem("authUser", JSON.stringify(data.user))

// Error handling
try {
  // ...
} catch (err) {
  if (err instanceof ApiError) {
    setError(err.message)
  } else if (err instanceof Error) {
    if (err.message.includes("fetch")) {
      setError(`Unable to connect to server at ${BASE_URL}`)
    } else {
      setError(err.message)
    }
  }
}
```

**Changes:**
- ✅ Proper token storage keys: `authToken` + `authUser`
- ✅ Check existing auth on mount
- ✅ Typed error handling
- ✅ Better error messages
- ✅ Fixed API URL (3001 → 3000)

---

## 5️⃣ Employee Page - Use apiFetch

### BEFORE ❌
```typescript
// src/app/(dashboard)/employee/page.tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL

useEffect(() => {
  const fetchTickets = async () => {
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("API failed")
      }

      const data: Ticket[] = await res.json()
      setTickets(data)

    } catch (err) {
      console.error("Failed to fetch tickets:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchTickets()
}, [])

if (loading) {
  return <p className="text-sm text-gray-500">Loading reports...</p>
}
```

### AFTER ✅
```typescript
// src/app/(dashboard)/employee/page.tsx
import { apiFetch, ApiError } from "@/lib/api"

const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchTickets = async () => {
    try {
      // apiFetch automatically:
      // - Adds Bearer token
      // - Handles 401/403 errors
      // - Parses JSON
      const data: Ticket[] = await apiFetch("/tickets")
      setTickets(data)
    } catch (err) {
      if (err instanceof ApiError) {
        console.error(`API Error ${err.statusCode}: ${err.message}`)
        setError(err.message)
      } else {
        console.error("Failed to fetch tickets:", err)
        setError("Failed to load tickets")
      }
    } finally {
      setLoading(false)
    }
  }

  fetchTickets()
}, [])

if (loading) {
  return <p className="text-sm text-gray-500">Loading reports...</p>
}

if (error) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
      <p className="text-red-700">Error loading tickets</p>
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  )
}
```

**Changes:**
- ✅ Simple: `apiFetch('/tickets')` instead of manual fetch
- ✅ Automatic token injection
- ✅ Typed error handling
- ✅ Error display in UI
- ✅ No more `localStorage.getItem("token")`

---

## 6️⃣ Create POST Example

### BEFORE ❌
```typescript
// Making a POST request (old way)
const handleCreateTicket = async (formData: any) => {
  const token = localStorage.getItem("token")

  try {
    const res = await fetch("http://localhost:3001/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title: formData.title,
        summary: formData.summary,
        department: formData.department,
        priority: formData.priority
      })
    })

    if (!res.ok) {
      throw new Error("Failed to create ticket")
    }

    const data = await res.json()
    console.log("Ticket created:", data)
  } catch (err) {
    console.error("Error:", err)
  }
}
```

### AFTER ✅
```typescript
// Making a POST request (new way)
import { apiFetch, ApiError } from "@/lib/api"

const handleCreateTicket = async (formData: any) => {
  try {
    const result = await apiFetch("/tickets", {
      method: "POST",
      body: JSON.stringify({
        title: formData.title,
        summary: formData.summary,
        department: formData.department,
        priority: formData.priority
      })
    })

    console.log("Ticket created:", result)
    // Show success toast
    toast.success("Ticket created successfully")
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 400) {
        toast.error("Invalid ticket data: " + err.message)
      } else {
        toast.error("Failed to create ticket: " + err.message)
      }
    } else {
      toast.error("An unexpected error occurred")
    }
  }
}
```

**Simpler, cleaner, automatic handling!**

---

## 7️⃣ Using Auth State

### BEFORE ❌
```typescript
// Getting user info (old way)
const [user, setUser] = useState<any>(null)

useEffect(() => {
  const userJson = localStorage.getItem("user")
  if (userJson) {
    setUser(JSON.parse(userJson))
  }
}, [])

// In component
<p>User: {user?.name}</p>
```

### AFTER ✅
```typescript
// Getting user info (new way)
import { useAuth } from "@/lib/auth-context"

export function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please log in</div>

  // Simple and clean!
  return (
    <div>
      <p>User: {user?.name}</p>
      <p>Role: {user?.role}</p>
      <p>Email: {user?.email}</p>
    </div>
  )
}
```

**One hook, all info, automatic sync!**

---

## 8️⃣ Environment Configuration

### BEFORE ❌
```
// No .env.local file
// Hardcoded URLs everywhere
// "http://localhost:3001" scattered in code
```

### AFTER ✅
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Now:** Change URL in ONE place, used everywhere!

---

## 9️⃣ Error Handling Example

### BEFORE ❌
```typescript
try {
  const res = await fetch('/api/something')
  if (!res.ok) throw new Error('Failed')
  const data = await res.json()
} catch (err) {
  // Generic error
  console.error('Something went wrong')
  setError('Unable to load data')
}
```

### AFTER ✅
```typescript
import { apiFetch, ApiError } from '@/lib/api'

try {
  const data = await apiFetch('/something')
} catch (err) {
  if (err instanceof ApiError) {
    // Specific error handling
    switch (err.statusCode) {
      case 400:
        setError(`Invalid request: ${err.message}`)
        break
      case 401:
        setError('Session expired. Please log in again.')
        break
      case 403:
        setError('You do not have permission to access this.')
        break
      case 404:
        setError('Resource not found.')
        break
      default:
        setError(err.message)
    }
  }
}
```

**Typed errors with specific handling!**

---

## 🔟 Protected Routes Example

### BEFORE ❌
```typescript
// No route protection
// Anyone can visit /admin even if not authorized
export default function AdminPage() {
  // ...
}
```

### AFTER ✅
```typescript
import { ProtectedRoute } from '@/components/protected-route'

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['IT_ADMIN', 'HR']}>
      <AdminContent />
    </ProtectedRoute>
  )
}

// Also protects in layout:
export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requiredRoles={['IT_ADMIN']}>
      <div className="admin-layout">
        {children}
      </div>
    </ProtectedRoute>
  )
}
```

**Automatic role-based protection!**

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| Port | 3001 ❌ | 3000 ✅ |
| Token Key | `'token'` | `'authToken'` + `'authUser'` |
| API Calls | Raw `fetch()` | `apiFetch()` |
| Error Handling | Generic `Error` | Typed `ApiError` |
| Auth State | Scattered in components | Centralized `useAuth()` |
| 401 Handling | Manual | Auto-redirect ✅ |
| Token Injection | Manual | Automatic ✅ |
| Route Protection | None | `ProtectedRoute` component |
| Config | Hardcoded | `.env.local` |

---

## Pattern Templates

### GET Request
```javascript
const data = await apiFetch('/endpoint')
```

### POST Request
```javascript
const result = await apiFetch('/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### PATCH Request
```javascript
const updated = await apiFetch(`/endpoint/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(updates)
})
```

### DELETE Request
```javascript
await apiFetch(`/endpoint/${id}`, {
  method: 'DELETE'
})
```

### With Query Params
```javascript
const data = await apiFetch('/endpoint?status=OPEN&priority=HIGH')
```

### Error Handling
```javascript
try {
  const data = await apiFetch('/endpoint')
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`${err.statusCode}: ${err.message}`)
  }
}
```

### Use Auth
```javascript
const { user, isAuthenticated, logout } = useAuth()
```

---

## 🎯 All Changes at a Glance

✅ Fixed API URL (3001 → 3000)  
✅ Enhanced error handling (ApiError class)  
✅ Centralized auth state (AuthProvider)  
✅ Automatic token injection (apiFetch)  
✅ Better token storage keys  
✅ 401 auto-redirects  
✅ 403 permission handling  
✅ Auth hook for all components  
✅ Protected route component  
✅ Logout functionality  
✅ Environment configuration  

**All done! 🎉**
