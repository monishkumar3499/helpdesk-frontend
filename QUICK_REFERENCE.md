# Quick Reference Card

## 🔐 Authentication

### Login (No Token Needed)
```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'pass' })
})
const data = await response.json()
localStorage.setItem('authToken', data.access_token)
localStorage.setItem('authUser', JSON.stringify(data.user))
```

## 🎯 API Calls (All Require Token)

### Get Data
```javascript
import { apiFetch } from '@/lib/api'

// Simple GET
const data = await apiFetch('/users/me/profile')

// With query parameters
const tickets = await apiFetch('/tickets?status=OPEN&priority=HIGH')
const users = await apiFetch('/users?role=HR')
```

### Create Ticket
```javascript
const ticket = await apiFetch('/tickets', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Title',
    summary: 'Description',
    department: 'IT',
    priority: 'HIGH'
  })
})
```

### Update Ticket
```javascript
const updated = await apiFetch(`/tickets/${ticketId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    priority: 'MEDIUM',
    status: 'IN_PROGRESS'
  })
})
```

### Delete Ticket (IT_ADMIN Only)
```javascript
await apiFetch(`/tickets/${ticketId}`, { method: 'DELETE' })
```

## 👤 Users

### Get My Profile
```javascript
const profile = await apiFetch('/users/me/profile')
// Returns: { id, name, email, role, isActive, createdAt }
```

### Get All Users (HR/IT Only)
```javascript
const users = await apiFetch('/users')
const hrUsers = await apiFetch('/users?role=HR')
```

### Create User (HR/IT_ADMIN Only)
```javascript
const user = await apiFetch('/users', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Pass123!',
    role: 'EMPLOYEE'
  })
})
```

## 🎫 Tickets

### Get My Tickets
```javascript
const myTickets = await apiFetch('/tickets/mine')
```

### Get All Tickets (HR/IT Only)
```javascript
const tickets = await apiFetch('/tickets')
const open = await apiFetch('/tickets?status=OPEN')
const urgent = await apiFetch('/tickets?priority=URGENT')
const it = await apiFetch('/tickets?department=IT')
```

### Create Ticket
```javascript
const ticket = await apiFetch('/tickets', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Printer broken',
    summary: 'Office printer not working',
    department: 'IT',
    priority: 'HIGH'
  })
})
```

### Update Ticket Status
```javascript
await apiFetch(`/tickets/${ticketId}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'RESOLVED' })
})
// Valid: OPEN, IN_PROGRESS, CLOSED, RESOLVED
```

### Assign Ticket
```javascript
await apiFetch(`/tickets/${ticketId}`, {
  method: 'PATCH',
  body: JSON.stringify({ assignedToId: 'user-id' })
})
```

## 📦 Assets

### Get My Assets
```javascript
const myAssets = await apiFetch('/assets/mine')
```

### Get All Assets (HR/IT Only)
```javascript
const all = await apiFetch('/assets')
const laptops = await apiFetch('/assets?category=LAPTOP')
const available = await apiFetch('/assets?status=AVAILABLE')
```

### Create Asset (IT Only)
```javascript
const asset = await apiFetch('/assets', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Dell Laptop',
    serialNumber: 'DELL123',
    category: 'LAPTOP',
    status: 'AVAILABLE',
    purchaseDate: '2025-02-28'
  })
})
```

### Assign Asset
```javascript
await apiFetch(`/assets/${assetId}/assign`, {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user-id',
    assignmentDate: '2026-03-10'
  })
})
```

## 🪝 React Hooks

### useAuth() - Access User & Token
```javascript
import { useAuth } from '@/lib/auth-context'

const { user, token, isAuthenticated, loading, logout } = useAuth()

// user: { id, email, name, role }
// token: JWT string
// isAuthenticated: boolean
// loading: boolean
// logout: function
```

### useLogout() - Logout User
```javascript
import { useLogout } from '@/hooks/use-logout'

const { logout } = useLogout()
```

## 🛡️ Error Handling

```javascript
import { apiFetch, ApiError } from '@/lib/api'

try {
  const data = await apiFetch('/endpoint')
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`${err.statusCode}: ${err.message}`)
    // 401: Unauthorized (redirects automatically)
    // 403: Forbidden (no permission)
    // 404: Not Found
    // 400: Bad Request
    // 500: Server Error
  }
}
```

## 👥 User Roles

| Role | Can Create Users | Can Manage Tickets | Can Manage Assets |
|------|-----|-----|-----|
| EMPLOYEE | ❌ | Own only | View own |
| HR | ✅ | ✅ | View all |
| IT_SUPPORT | ❌ | ✅ | ✅ |
| IT_ADMIN | ✅ | ✅ | ✅ |

## 🎛️ Authentication State

```javascript
<>
  {loading && <p>Loading...</p>}
  {!isAuthenticated && <p>Please log in</p>}
  {user && <p>Hello {user.name}!</p>}
  <button onClick={logout}>Logout</button>
</>
```

## 📍 Route Protection

```javascript
import { ProtectedRoute } from '@/components/protected-route'

// Require authentication only
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// Require specific roles
<ProtectedRoute requiredRoles={['HR', 'IT_ADMIN']}>
  <AdminComponent />
</ProtectedRoute>
```

## 🌍 Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🔗 Endpoints Summary

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | /auth/login | ❌ | — |
| GET | /users/me/profile | ✅ | All |
| GET | /users | ✅ | HR, IT |
| POST | /users | ✅ | HR, IT_ADMIN|
| GET | /tickets | ✅ | HR, IT |
| GET | /tickets/mine | ✅ | All |
| POST | /tickets | ✅ | All |
| PATCH | /tickets/:id | ✅ | HR, IT |
| PATCH | /tickets/:id/status | ✅ | HR, IT |
| DELETE | /tickets/:id | ✅ | IT_ADMIN |
| GET | /assets | ✅ | HR, IT |
| GET | /assets/mine | ✅ | All |
| POST | /assets | ✅ | IT |
| POST | /assets/:id/assign | ✅ | IT |

## ⚡ Common Patterns

### With Loading State
```javascript
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetch = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/endpoint')
      setData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetch()
}, [])
```

### In Component
```javascript
if (loading) return <p>Loading...</p>
if (error) return <p>Error: {error}</p>
return <YourContent />
```

---

**Save this for quick reference!** 📌
