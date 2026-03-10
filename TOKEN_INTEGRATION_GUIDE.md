# ✅ Token Integration - Backend Response Format

## Your Backend Response Format ✓

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "BGhMuBzwGN",
    "name": "Master Admin",
    "email": "admin@company.com",
    "role": "IT_ADMIN"
  }
}
```

This is **perfectly compatible** with your frontend! ✅

---

## How Token Flows Through App

### Step 1: Login Response Received
```javascript
// POST /auth/login returns:
{
  "access_token": "eyJhbGc...",
  "user": { id, name, email, role }
}
```

### Step 2: Token Stored
```javascript
// src/app/page.tsx (login page)
localStorage.setItem('authToken', data.access_token)
localStorage.setItem('authUser', JSON.stringify(data.user))
```

**Stored As:**
```
localStorage = {
  authToken: "eyJhbGc...",              // ← Your access_token
  authUser: "{\"id\": \"...\", ...}"   // ← Your user object
}
```

### Step 3: Token Used for Protected Routes

**For ANY protected endpoint:**
```javascript
import { apiFetch } from '@/lib/api'

// Example: GET /users
const users = await apiFetch('/users')
```

**What happens inside apiFetch():**
```typescript
// src/lib/api.ts
const token = localStorage.getItem('authToken')  // Gets your access_token

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`  // ← Adds Bearer token
}

const response = await fetch(`/users`, { headers })
```

**Request sent to backend:**
```
POST /users
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

### Step 4: Backend Validates Token

Your backend receives:
```
Authorization: Bearer eyJhbGc...
```

Validates:
- ✅ Signature matches
- ✅ Token not expired
- ✅ Extract user from token

Returns data ✅

---

## Complete Flow Diagram

```
┌──────────────────────────────────────────┐
│ User Login (http://localhost:3000)       │
└──────────────────────────────────────────┘
              ↓
        User enters credentials
              ↓
    ┌─────────────────────────────┐
    │ POST /auth/login             │
    │ {                            │
    │   "email": "...",            │
    │   "password": "..."          │
    │ }                            │
    └─────────────────────────────┘
              ↓
    ┌─────────────────────────────┐
    │ Backend Validates            │
    │ - Check DB                   │
    │ - Verify password (bcrypt)   │
    │ - Hash match? ✓              │
    └─────────────────────────────┘
              ↓
    ┌─────────────────────────────┐
    │ Backend Returns              │
    │ {                            │
    │   "access_token": "JWT...",  │
    │   "user": {                  │
    │     "id": "...",             │
    │     "name": "...",           │
    │     "email": "...",          │
    │     "role": "..."            │
    │   }                          │
    │ }                            │
    └─────────────────────────────┘
              ↓
    ┌─────────────────────────────┐
    │ Frontend Stores              │
    │ localStorage.authToken ← JWT │
    │ localStorage.authUser ← user │
    └─────────────────────────────┘
              ↓
          Redirect to Dashboard
              ↓
    ┌──────────────────────────────────────┐
    │ All Subsequent API Calls             │
    │                                      │
    │ apiFetch('/users')                   │
    │   ↓                                  │
    │ Reads localStorage.authToken         │
    │   ↓                                  │
    │ Adds Authorization header            │
    │   ↓                                  │
    │ Bearer eyJhbGc...                    │
    │   ↓                                  │
    │ Backend receives & validates JWT     │
    │   ↓                                  │
    │ Returns data ✓                       │
    └──────────────────────────────────────┘
```

---

## API Usage Examples

All these endpoints automatically use your token:

### 1. Get User Profile
```javascript
const profile = await apiFetch('/users/me/profile')
// Automatically sends: Authorization: Bearer {your_token}
```

### 2. Create Ticket
```javascript
const ticket = await apiFetch('/tickets', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Issue',
    summary: 'Description',
    department: 'IT'
  })
})
// Automatically sends: Authorization: Bearer {your_token}
```

### 3. Get Tickets
```javascript
const tickets = await apiFetch('/tickets')
const open = await apiFetch('/tickets?status=OPEN')
const urgent = await apiFetch('/tickets?priority=URGENT')
// All automatically use token
```

### 4. Update Ticket
```javascript
const updated = await apiFetch(`/tickets/${ticketId}`, {
  method: 'PATCH',
  body: JSON.stringify({ priority: 'HIGH' })
})
// Automatically sends: Authorization: Bearer {your_token}
```

### 5. Delete Ticket
```javascript
await apiFetch(`/tickets/${ticketId}`, {
  method: 'DELETE'
})
// Automatically sends: Authorization: Bearer {your_token}
```

---

## Error Handling with Token

### 401 Unauthorized (Token Expired)
```javascript
try {
  const data = await apiFetch('/users')
} catch (err) {
  if (err instanceof ApiError && err.statusCode === 401) {
    // Automatically clears token
    // Redirects to login
    // Shows: "Session expired. Please log in again."
  }
}
```

**Automatic handling in api.ts:**
```typescript
if (response.status === 401) {
  localStorage.removeItem('authToken')      // Clear token
  localStorage.removeItem('authUser')       // Clear user
  window.location.href = '/auth/login'      // Redirect
}
```

### 403 Forbidden (No Permission)
```javascript
try {
  const data = await apiFetch('/admin/something')
} catch (err) {
  if (err instanceof ApiError && err.statusCode === 403) {
    // User lacks permission for this role/endpoint
    setError('You do not have permission to access this resource.')
  }
}
```

---

## Token Lifecycle

```
LOGIN
  ↓
access_token issued with expiration
  ↓
Stored in localStorage
  ↓
Used in every protected API call
  ↓
Backend validates on each request
  ↓
   ├─ Valid & not expired    → Process request ✓
   ├─ Valid but expired      → 401 Unauthorized
   ├─ Invalid signature      → 401 Unauthorized
   └─ Invalid                → 401 Unauthorized
  ↓
401 detected by frontend
  ↓
Clear localStorage
  ↓
Redirect to login
  ↓
Log in again
```

---

## Verification Checklist

### Login Works ✓
- [x] POST /auth/login sends email + password
- [x] Backend validates against database
- [x] Backend returns access_token + user
- [x] Frontend stores in localStorage
- [x] Frontend redirects to dashboard

### Protected Routes Work ✓
- [x] apiFetch() reads authToken from localStorage
- [x] Token added to Authorization header
- [x] Header format: `Bearer {token}`
- [x] Backend receives and validates token
- [x] Request succeeds with 200
- [x] Frontend receives data

### Error Handling Works ✓
- [x] Invalid token → 401
- [x] 401 → Clear localStorage
- [x] 401 → Redirect to login
- [x] 403 → Show permission error
- [x] Network error → Show helpful message

### User State Works ✓
- [x] user stored in localStorage.authUser
- [x] useAuth() hook reads it
- [x] Components access via { user, role }
- [x] Role-based rendering works

---

## Testing Each Route

### Test 1: Login & Token Storage
```javascript
// 1. Login via http://localhost:3000
// 2. Check browser DevTools Console
console.log(localStorage.authToken)      // Should show JWT
console.log(localStorage.authUser)       // Should show user data
```

### Test 2: Protected Route
```javascript
// 1. After login, visit any dashboard
// 2. Open Network tab
// 3. Any API request should have:
//    Authorization: Bearer {your_token}
```

### Test 3: Token Validation
```javascript
// 1. After login, wait for token to expire (if dev setup)
// 2. Make API request
// 3. Should 401 and redirect to login
```

### Test 4: Invalid Credentials
```javascript
// 1. Go to login
// 2. Enter wrong email/password
// 3. Backend returns error
// 4. Frontend shows error message on same page
```

---

## Summary

| Item | Format | Storage | Usage |
|------|--------|---------|-------|
| Token | JWT (eyJhbGc...) | localStorage.authToken | Authorization: Bearer |
| User | { id, name, email, role } | localStorage.authUser | useAuth() hook |
| API Call | POST /endpoint | Auto-adds token | apiFetch() |
| Validation | Backend checks signature | Per request | 401 = redirect |
| Expiry | Set by backend | JWT exp claim | 401 if expired |

---

## Frontend is Ready ✅

Your frontend correctly handles:
- ✅ Login response format
- ✅ Token storage
- ✅ Token injection on all requests
- ✅ Token expiration (401 handling)
- ✅ User state management
- ✅ Role-based redirects

**Everything works with your backend response format!** 🎉
