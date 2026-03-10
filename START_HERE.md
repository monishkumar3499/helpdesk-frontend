# 🎯 START HERE - Getting Started Guide

## What Just Happened?

Your Next.js helpdesk frontend has been **completely restructured** for proper integration with your backend API. Everything is now properly configured for JWT authentication and secure API calls.

---

## ✅ What's Ready to Use

### 1. Login is Working ✅
- Go to `http://localhost:3000/auth/login` in your browser
- Login with your credentials
- Token is automatically stored and managed
- You'll be redirected to your dashboard

### 2. Token Management is Automatic ✅
- No more manual token injections
- No more localStorage.getItem('token')
- Just use `apiFetch()` everywhere

### 3. Error Handling is Built-in ✅
- 401 errors auto-redirect to login
- 403 errors show permission denied
- Network errors show meaningful messages

---

## 📖 Read These First

In this order:

1. **Quick Reference** (2 min read)
   - File: `QUICK_REFERENCE.md`
   - What: Common API calls and patterns
   - Why: You'll reference this constantly

2. **Authentication Setup** (5 min read)
   - File: `AUTHENTICATION_SETUP.md`
   - What: Complete guide to how it all works
   - Why: Understand the flow before coding

3. **Integration Summary** (3 min read)
   - File: `INTEGRATION_SUMMARY.md`
   - What: What changed and why
   - Why: Understand what was fixed

---

## 🚀 Quick Test

### 1. Start Backend
```bash
# In your backend directory
npm run dev
# Should run on http://localhost:3000
```

### 2. Start Frontend
```bash
# In this directory (helpdesk-frontend)
npm run dev
# Should run on http://localhost:3000 (Next.js dev server)
```

### 3. Test Login
- Open browser: http://localhost:3000/auth/login
- Login with your test account
- Check browser Console → Application → LocalStorage
  - Should see: `authToken` and `authUser`
- Should redirect to dashboard
- ✅ If this works, you're good!

---

## 💻 Update Your Pages

### 1. Copy the Template
- File: `src/components/EXAMPLE_PAGE_IMPLEMENTATION.tsx`
- This shows the EXACT pattern to use for every page

### 2. Follow the Checklist
- File: `IMPLEMENTATION_CHECKLIST.md`
- Lists every page that needs updating
- Prioritized by importance
- Start with high priority items

### 3. Update Your Pages
For EACH page:
- Import: `import { apiFetch, ApiError } from '@/lib/api'`
- Replace all `fetch()` calls with `apiFetch()`
- Wrap in try-catch with `ApiError` handling
- Add loading/error states

---

## 🔑 Key Files Explained

### New Files (Don't Touch Unless Needed)
- `src/lib/auth-context.tsx` - Authentication state management
- `src/components/protected-route.tsx` - Route protection
- `src/hooks/use-logout.ts` - Logout functionality
- `.env.local` - Configuration

### Updated Files (Reference These)
- `src/lib/api.ts` - The API helper function
- `src/app/layout.tsx` - App layout with AuthProvider
- `src/app/(auth)/login/page.tsx` - Login page (complete example)
- `src/app/(dashboard)/employee/page.tsx` - Dashboard example

### Documentation (Read These)
- `QUICK_REFERENCE.md` - Common patterns
- `AUTHENTICATION_SETUP.md` - Full guide
- `INTEGRATION_SUMMARY.md` - What changed
- `IMPLEMENTATION_CHECKLIST.md` - What to update
- `src/lib/API_INTEGRATION_GUIDE.ts` - Code examples
- `src/components/EXAMPLE_PAGE_IMPLEMENTATION.tsx` - Complete example

---

## 🎯 Your Next Steps

### This Week
- [ ] Read `QUICK_REFERENCE.md` (2 min)
- [ ] Read `AUTHENTICATION_SETUP.md` (5 min)
- [ ] Test login in browser
- [ ] Run this command to verify setup:
  ```javascript
  // In browser console after login
  console.log(localStorage.authToken)
  console.log(JSON.parse(localStorage.authUser))
  ```

### This Sprint
- [ ] Review `EXAMPLE_PAGE_IMPLEMENTATION.tsx`
- [ ] Update HIGH priority pages (HR, my-tickets, raise-ticket)
- [ ] Test each page
- [ ] Update MEDIUM priority pages
- [ ] Update LOW priority pages

---

## 🚨 Important Changes from Old Code

### ❌ Old Way (Don't Do This)
```javascript
const token = localStorage.getItem('token')
const res = await fetch('http://localhost:3001/tickets', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### ✅ New Way (Do This)
```javascript
import { apiFetch } from '@/lib/api'
const data = await apiFetch('/tickets')
```

### Key Differences
1. Port changed: `3001` → `3000`
2. Token storage: `'token'` → `'authToken'` + `'authUser'`
3. API calls: Manual fetch → `apiFetch()`
4. Error handling: Generic → Typed `ApiError`

---

## 🆘 Troubleshooting

### Problem: Page shows "Loading..." forever

**Solution:**
1. Check AuthProvider is in layout.tsx
2. Check localStorage has authToken
3. Check backend is running on 3000
4. Check .env.local has correct URL

### Problem: 404 Errors

**Solution:**
1. Verify backend running: `npm run dev`
2. Check URL: Should be 3000, NOT 3001
3. Check endpoint: Match API reference exactly

### Problem: 401 Unauthorized

**Solution:**
1. Login again
2. Clear localStorage: `localStorage.clear()`
3. Check backend auth endpoint works

### Problem: Pages still using old fetch()

**Solution:**
1. Search for `const token = localStorage.getItem`
2. Replace with `import { apiFetch } from '@/lib/api'`
3. Use `apiFetch()` instead of `fetch()`

---

## ✨ What You Can Do Now

### 1. Access User Info Anywhere
```javascript
const { user, isAuthenticated } = useAuth()
console.log(user.name, user.role) // Has all info
```

### 2. Make Secure API Calls
```javascript
const tickets = await apiFetch('/tickets?status=OPEN')
// Token automatically added!
```

### 3. Handle Errors Properly
```javascript
try {
  await apiFetch('/tickets')
} catch (err) {
  if (err instanceof ApiError) {
    if (err.statusCode === 403) {
      alert('You do not have permission')
    }
  }
}
```

### 4. Protect Routes
```javascript
<ProtectedRoute requiredRoles={['HR', 'IT_ADMIN']}>
  <AdminPanel />
</ProtectedRoute>
```

---

## 📊 Architecture Overview

```
User Browser
    ↓
Login Page (src/app/(auth)/login/page.tsx)
    ↓ (POST /auth/login)
Backend (http://localhost:3000)
    ↓ (returns token)
localStorage (authToken + authUser)
    ↓
AuthProvider (src/lib/auth-context.tsx)
    ↓ (provides useAuth() hook)
Your Components
    ↓ (can access user via useAuth())
apiFetch() (src/lib/api.ts)
    ↓ (auto-adds token)
Backend API Endpoints
    ↓
Success or error handling
```

---

## 🎓 Learning Resources

1. **These docs (start here)**
   - QUICK_REFERENCE.md
   - AUTHENTICATION_SETUP.md

2. **Example implementations**
   - src/components/EXAMPLE_PAGE_IMPLEMENTATION.tsx
   - src/app/(auth)/login/page.tsx
   - src/app/(dashboard)/employee/page.tsx

3. **Code reference**
   - src/lib/api.ts (how apiFetch works)
   - src/lib/auth-context.tsx (how auth works)

---

## ✅ Success Criteria

You'll know everything is working when:

- [ ] Login redirects to dashboard
- [ ] localStorage has authToken after login
- [ ] All API calls use apiFetch()
- [ ] 401 errors redirect to login
- [ ] Error messages show in UI
- [ ] Pages can access user info via useAuth()
- [ ] Logout clears tokens and redirects

---

## 🎉 You're All Set!

Everything is ready to go. Your frontend now has:

✅ Proper JWT authentication  
✅ Automatic token injection  
✅ Typed error handling  
✅ Protected routes  
✅ Auth context for state management  
✅ Clear documentation  
✅ Working examples  

**Time to code! Good luck! 🚀**

---

### Questions?

1. Check `QUICK_REFERENCE.md` for common patterns
2. Look at `EXAMPLE_PAGE_IMPLEMENTATION.tsx` for complete example
3. Read `AUTHENTICATION_SETUP.md` for detailed explanation
4. Review `src/lib/API_INTEGRATION_GUIDE.ts` for more examples

**Everything is documented. Everything is ready. Let's build! 💪**
