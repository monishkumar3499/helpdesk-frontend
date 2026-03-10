# 📋 Implementation Checklist

## ✅ Completed

- [x] **Core Authentication System**
  - [x] `src/lib/auth-context.tsx` - Created
  - [x] `src/app/layout.tsx` - Updated (added AuthProvider)
  - [x] `src/app/(auth)/login/page.tsx` - Updated

- [x] **API Integration**
  - [x] `src/lib/api.ts` - Enhanced with better error handling
  - [x] Fixed API URL from 3001 → 3000
  - [x] Created ApiError class for typed errors

- [x] **Components & Hooks**
  - [x] `src/components/protected-route.tsx` - Created
  - [x] `src/hooks/use-logout.ts` - Created

- [x] **Documentation**
  - [x] `AUTHENTICATION_SETUP.md` - Complete guide
  - [x] `INTEGRATION_SUMMARY.md` - What changed
  - [x] `QUICK_REFERENCE.md` - Quick lookup
  - [x] `src/lib/API_INTEGRATION_GUIDE.ts` - Examples
  - [x] `src/components/EXAMPLE_PAGE_IMPLEMENTATION.tsx` - Full example

- [x] **Configuration**
  - [x] `.env.local` - Environment setup

- [x] **Example**
  - [x] `src/app/(dashboard)/employee/page.tsx` - Updated to use apiFetch

---

## 🚀 TODO - Update Other Pages

### Dashboard Pages

- [ ] **`src/app/(dashboard)/HR/page.tsx`**
  - [ ] Replace raw fetch with `apiFetch()`
  - [ ] Add error handling
  - [ ] Add loading state
  - [ ] Import: `import { apiFetch, ApiError } from '@/lib/api'`

- [ ] **`src/app/(dashboard)/IT/page.tsx`**
  - [ ] Replace raw fetch with `apiFetch()`
  - [ ] Add error handling
  - [ ] Add loading state

### Employee Sub-pages

- [ ] **`src/app/(dashboard)/employee/my-tickets/page.tsx`**
  - [ ] Replace raw fetch: `await fetch(...)`
  - [ ] Use: `await apiFetch('/tickets/mine')`
  - [ ] Update Column definitions if showing user data
  - [ ] Add error handling

- [ ] **`src/app/(dashboard)/employee/raise-ticket/page.tsx`**
  - [ ] Form submission should use `apiFetch()` to POST
  - [ ] Add error state display
  - [ ] Show success message after creation
  - [ ] Reset form on success

- [ ] **`src/app/(dashboard)/employee/calendar/page.tsx`**
  - [ ] If fetching data, use `apiFetch()`
  - [ ] Update as needed for calendar view

### HR Sub-pages

- [ ] **`src/app/(dashboard)/HR/Tickets/page.tsx`**
  - [ ] Fetch all tickets: `await apiFetch('/tickets')`
  - [ ] Add filters for status/priority
  - [ ] Add update/status change functionality

- [ ] **`src/app/(dashboard)/HR/employees/page.tsx`**
  - [ ] Fetch users: `await apiFetch('/users')`
  - [ ] Add create user form
  - [ ] Add user role selection
  - [ ] Add toggle active/inactive

- [ ] **`src/app/(dashboard)/HR/Calendar/page.tsx`**
  - [ ] Update as needed

- [ ] **`src/app/(dashboard)/HR/Reports/page.tsx`**
  - [ ] Use `apiFetch()` for data
  - [ ] Add filtering/export if needed

- [ ] **`src/app/(dashboard)/HR/SLA/page.tsx`**
  - [ ] Use `apiFetch()` for data

---

## 🔧 Template for Each Page

### 1. Add Imports
```javascript
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiFetch, ApiError } from '@/lib/api'
```

### 2. Define State
```javascript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
```

### 3. Fetch Data
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await apiFetch('/endpoint')
      setData(result)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

### 4. Render
```javascript
if (loading) return <p>Loading...</p>
if (error) return <p>Error: {error}</p>
// Your component JSX
```

---

## 📝 Pattern Examples

### Create/POST
```javascript
const handleCreate = async (formData) => {
  try {
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
    // Success
  } catch (err) {
    if (err instanceof ApiError) {
      setError(err.message)
    }
  }
}
```

### Update/PATCH
```javascript
const handleUpdate = async (id, updates) => {
  try {
    await apiFetch(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    // Success - refresh list
    setData(prev => [...])
  } catch (err) {
    // Error handling
  }
}
```

### Delete
```javascript
const handleDelete = async (id) => {
  try {
    await apiFetch(`/tickets/${id}`, {
      method: 'DELETE'
    })
    // Success - remove from list
  } catch (err) {
    // Error handling
  }
}
```

---

## 🧪 Testing Checklist

After updating each page:

- [ ] Can fetch data from API
- [ ] Loading state shows while fetching
- [ ] Error state shows on API failure
- [ ] Token is sent with requests
- [ ] 401 errors redirect to login
- [ ] 403 errors show permission message
- [ ] Data displays correctly
- [ ] No console errors

---

## 📊 Progress Tracking

### Core System (100% ✅)
- Auth Context: ✅
- API Helper: ✅
- Protected Routes: ✅
- Login Page: ✅

### Documentation (100% ✅)
- Setup Guide: ✅
- Integration Summary: ✅
- Quick Reference: ✅
- Examples: ✅

### Dashboard Pages (Need Updates)
- Employee Home: ✅ (Updated)
- HR Home: ⏳ TODO
- IT Home: ⏳ TODO
- Employee Sub-pages: ⏳ TODO
- HR Sub-pages: ⏳ TODO

---

## 🎯 Priority Order (Recommended)

1. **High Priority** - Update these first
   - [ ] `src/app/(dashboard)/HR/page.tsx`
   - [ ] `src/app/(dashboard)/employee/my-tickets/page.tsx`
   - [ ] `src/app/(dashboard)/employee/raise-ticket/page.tsx`

2. **Medium Priority** - Update next
   - [ ] `src/app/(dashboard)/HR/employees/page.tsx`
   - [ ] `src/app/(dashboard)/HR/Tickets/page.tsx`

3. **Low Priority** - Update last
   - [ ] Calendar pages
   - [ ] Reports pages
   - [ ] SLA pages

---

## 🚨 Common Issues to Watch For

When updating pages:

- [ ] Don't forget `'use client'` at top
- [ ] Always import `apiFetch, ApiError`
- [ ] Always add try-catch around apiFetch
- [ ] Check error instance with `instanceof ApiError`
- [ ] Add loading/error state rendering
- [ ] Use correct endpoint from API reference
- [ ] Use correct method (GET/POST/PATCH/DELETE)
- [ ] Match request body to API spec

---

## 📚 Resources

- **Full Guide:** `AUTHENTICATION_SETUP.md`
- **What Changed:** `INTEGRATION_SUMMARY.md`
- **Quick Lookup:** `QUICK_REFERENCE.md`
- **Code Examples:** `src/lib/API_INTEGRATION_GUIDE.ts`
- **Complete Example:** `src/components/EXAMPLE_PAGE_IMPLEMENTATION.tsx`

---

## ✨ Pro Tips

1. **Use Copy-Paste:** Start with `EXAMPLE_PAGE_IMPLEMENTATION.tsx` and modify
2. **Test Incrementally:** Update one page at a time and test
3. **Keep It DRY:** Create custom hooks for common patterns
4. **Error Messages:** Show meaningful error messages to users
5. **Loading States:** Always show loading to improve UX

---

**Last Updated:** March 10, 2026  
**Status:** Ready for implementation! 🚀
