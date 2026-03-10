# Helpdesk Frontend - Authentication & API Integration Guide

## ✅ Setup Complete

Your frontend is now properly configured with:
- ✅ JWT token-based authentication
- ✅ Automatic token injection in API calls
- ✅ Protected route components
- ✅ Auth context for state management
- ✅ Proper error handling with 401/403 redirects
- ✅ Role-based access control

---

## 🔧 Configuration

### 1. Environment Variables

Make sure `.env.local` is configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important:** The backend runs on port `3000`, NOT `3001`. Previous code used `3001` which caused connection failures.

### 2. Backend Requirements

Ensure your backend is running:
```bash
# From your backend directory
npm run dev
# Backend should be available at http://localhost:3000
```

---

## 📦 What's New

### New Files Created

1. **`src/lib/auth-context.tsx`** - Auth provider and useAuth hook
2. **`src/components/protected-route.tsx`** - Route protection component
3. **`src/hooks/use-logout.ts`** - Logout hook
4. **`src/lib/API_INTEGRATION_GUIDE.ts`** - Comprehensive usage examples
5. **`.env.local`** - Environment configuration

### Updated Files

1. **`src/lib/api.ts`** - Enhanced apiFetch with better error handling
2. **`src/app/layout.tsx`** - Added AuthProvider wrapper
3. **`src/app/(auth)/login/page.tsx`** - Improved login flow with proper token storage
4. **`src/app/(dashboard)/employee/page.tsx`** - Updated to use apiFetch helper

---

## 🚀 Quick Start

### 1. Login Flow

The login page automatically handles:
- ✅ Form validation
- ✅ API authentication call
- ✅ Token storage (key: `authToken`)
- ✅ User data storage (key: `authUser`)
- ✅ Role-based redirects

**Stored Data:**
```javascript
localStorage.authToken    // JWT token
localStorage.authUser     // User object: {id, email, name, role}
```

### 2. Using Auth in Components

```javascript
import { useAuth } from '@/lib/auth-context'

export function MyComponent() {
  const { user, isAuthenticated, logout, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please log in</div>

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### 3. Making API Calls

**OLD WAY (❌ Don't do this):**
```javascript
const token = localStorage.getItem('token')
const res = await fetch('http://localhost:3001/tickets', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

**NEW WAY (✅ Do this):**
```javascript
import { apiFetch, ApiError } from '@/lib/api'

try {
  const tickets = await apiFetch('/tickets')
  // Token is automatically added!
  // Error handling is automatic!
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`Error ${err.statusCode}: ${err.message}`)
  }
}
```

### 4. Protecting Routes

```javascript
import { ProtectedRoute } from '@/components/protected-route'

export default function Dashboard() {
  return (
    <ProtectedRoute requiredRoles={['EMPLOYEE', 'HR', 'IT_ADMIN']}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
```

---

## 🔐 Token Management

### How Tokens Work

1. **Login:** User submits email/password → Backend returns JWT token
2. **Storage:** Token stored in `localStorage.authToken`
3. **API Calls:** `apiFetch()` automatically adds token to Authorization header
4. **Expiration:** If token expires (401 error), user is redirected to login
5. **Logout:** Token is cleared from localStorage

### Token Storage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `authToken` | JWT token (long string) | Used in Authorization header |
| `authUser` | User object (JSON) | Current user info |

### Token Lifecycle

```
Login Page
    ↓ (submit credentials)
Backend /auth/login
    ↓ (returns token + user)
localStorage (authToken, authUser)
    ↓
apiFetch() - auto adds token
    ↓
Protected API Endpoints
    ↓
Response or 401 → Redirect to login
```

---

## 🛡️ Error Handling

### ApiError Class

```javascript
try {
  await apiFetch('/some-endpoint')
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`Status: ${err.statusCode}`)
    console.error(`Message: ${err.message}`)
    console.error(`Error: ${err.error}`)
  }
}
```

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request body/parameters |
| 401 | Unauthorized | Token missing/expired → Redirect to login |
| 403 | Forbidden | User lacks permissions (role check) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend issue |

### Automatic Redirects

- **401:** Auto-redirects to `/auth/login`
- **403:** Not auto-handled (show permission error)

---

## 👥 Role-Based Access Control

### User Roles
- `EMPLOYEE` - Can create/view own tickets, view own assets
- `HR` - Can manage users, view all tickets, manage HR tickets
- `IT_SUPPORT` - Can manage tickets and assets
- `IT_ADMIN` - Full access to all features

### Check Role in Component

```javascript
const { user } = useAuth()

if (user?.role === 'IT_ADMIN') {
  // Show admin features
}

if (['HR', 'IT_ADMIN'].includes(user?.role)) {
  // Show dashboard
}
```

### Role-Protected Routes

```javascript
<ProtectedRoute requiredRoles={['HR', 'IT_ADMIN']}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## 📚 API Examples by Endpoint

### Authentication

**Login:**
```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'pass' })
})
const data = await response.json()
localStorage.setItem('authToken', data.access_token)
```

### Users (All use apiFetch)

**Get my profile:**
```javascript
const user = await apiFetch('/users/me/profile')
```

**Get all users:**
```javascript
const users = await apiFetch('/users')
const hrUsers = await apiFetch('/users?role=HR')
```

**Create user (HR/IT_ADMIN only):**
```javascript
const newUser = await apiFetch('/users', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'SecurePass123',
    role: 'EMPLOYEE'
  })
})
```

### Tickets (All use apiFetch)

**Get my tickets:**
```javascript
const myTickets = await apiFetch('/tickets/mine')
```

**Get all tickets (with filters):**
```javascript
const tickets = await apiFetch('/tickets')
const openTickets = await apiFetch('/tickets?status=OPEN')
const urgentTickets = await apiFetch('/tickets?priority=URGENT')
```

**Create ticket:**
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

**Update ticket:**
```javascript
await apiFetch(`/tickets/${ticketId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    priority: 'MEDIUM',
    assignedToId: 'new-user-id'
  })
})
```

**Change ticket status:**
```javascript
await apiFetch(`/tickets/${ticketId}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'IN_PROGRESS' })
})
```

### Assets (All use apiFetch)

**Get my assets:**
```javascript
const myAssets = await apiFetch('/assets/mine')
```

**Get all assets (with filters):**
```javascript
const assets = await apiFetch('/assets')
const laptops = await apiFetch('/assets?category=LAPTOP&status=AVAILABLE')
```

**Assign asset to user:**
```javascript
await apiFetch(`/assets/${assetId}/assign`, {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user-id',
    assignmentDate: '2026-03-10'
  })
})
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Unable to connect to server"

**Cause:** Backend not running or wrong URL  
**Solution:**
1. Check backend is running: `npm run dev` in backend directory
2. Verify URL in `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3000`
3. Not 3001 - it's **3000**!

### Issue: 401 Unauthorized

**Cause:** Token missing, expired, or invalid  
**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check token is being set: `localStorage.getItem('authToken')`

### Issue: 403 Forbidden

**Cause:** User role doesn't have permission  
**Solution:** Check user role matches required endpoint permissions:
```javascript
const { user } = useAuth()
console.log(`Current role: ${user?.role}`)
```

### Issue: CORS Errors

**Cause:** Backend not configured for frontend domain  
**Solution:** Ensure backend has proper CORS headers set

---

## 🔄 Complete Login → Dashboard Flow

```
1. User visits / redirected to /auth/login
   ↓
2. Login component loads
   - Checks if user already authenticated
   - If yes, redirects to dashboard
   ↓
3. User submits email/password
   ↓
4. POST /auth/login called (no token needed)
   ↓
5. Backend returns {access_token, user}
   ↓
6. Frontend stores:
   - localStorage.authToken = access_token
   - localStorage.authUser = user object
   ↓
7. Redirect to /employee or /HR based on role
   ↓
8. Dashboard loads with AuthProvider
   - AuthProvider reads localStorage
   - Sets auth state (user, token, isAuthenticated)
   ↓
9. Components can:
   - Access user via useAuth()
   - Call apiFetch('/endpoint') with auto token
   - Use ProtectedRoute for access control
   ↓
10. On API call:
    - apiFetch reads authToken from localStorage
    - Adds Authorization: Bearer <token>
    - If 401: clears localStorage, redirects to login
    ↓
11. On logout:
    - Clear localStorage
    - Redirect to /auth/login
```

---

## ✨ Next Steps

1. **Test login:** Navigate to http://localhost:3000/auth/login (your frontend)
2. **Verify backend:** Ensure backend is running on http://localhost:3000
3. **Check localStorage:** After login, verify tokens are stored:
   ```javascript
   console.log(localStorage.authToken)
   console.log(JSON.parse(localStorage.authUser))
   ```
4. **Update other pages:** Use `apiFetch()` instead of raw `fetch()` in all pages
5. **Add logout button:** Use `useLogout()` hook to clear auth

---

## 📖 Reference

- API Reference: See `src/lib/API_INTEGRATION_GUIDE.ts`
- Auth Context: `src/lib/auth-context.tsx`
- API Helper: `src/lib/api.ts`
- Protected Routes: `src/components/protected-route.tsx`

---

**Status:** ✅ Authentication system is ready to use!
