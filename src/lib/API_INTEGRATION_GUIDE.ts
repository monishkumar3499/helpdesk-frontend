/**
 * API Integration & Authentication Guide
 * 
 * This file demonstrates how to properly use authentication and API calls
 * throughout the helpdesk frontend application.
 */

// ============================================================================
// 1. USING AUTH CONTEXT
// ============================================================================

/*
import { useAuth } from '@/lib/auth-context'

export function MyComponent() {
  const { user, isAuthenticated, logout, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
*/

// ============================================================================
// 2. USING APIFETCH HELPER (AUTOMATIC TOKEN INJECTION)
// ============================================================================

/*
import { useEffect, useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'

interface Ticket {
  id: string
  title: string
  summary: string
  status: string
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // apiFetch automatically:
        // - Adds Bearer token from localStorage
        // - Handles 401/403 errors  
        // - Parses JSON responses
        // - Throws ApiError on failures
        const data = await apiFetch('/tickets?status=OPEN')
        setTickets(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`${err.statusCode}: ${err.message}`)
        } else {
          setError('An unexpected error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      {tickets.map((ticket) => (
        <div key={ticket.id}>{ticket.title}</div>
      ))}
    </div>
  )
}
*/

// ============================================================================
// 3. CREATING A RESOURCE (POST/CREATE)
// ============================================================================

/*
import { apiFetch, ApiError } from '@/lib/api'
import { useState } from 'react'

export function CreateTicketForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      
      const result = await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.get('title'),
          summary: formData.get('summary'),
          department: formData.get('department'),
          priority: formData.get('priority'),
        }),
      })

      console.log('Ticket created:', result)
      // Handle success (redirect, show toast, etc.)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to create ticket')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleCreateTicket}>
      <input name="title" type="text" required />
      <textarea name="summary" required />
      <select name="department" required>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
      </select>
      <select name="priority">
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Ticket'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
*/

// ============================================================================
// 4. UPDATING A RESOURCE (PATCH)
// ============================================================================

/*
import { apiFetch, ApiError } from '@/lib/api'

async function updateTicket(ticketId: string, updates: { priority?: string; status?: string }) {
  try {
    const result = await apiFetch(`/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return result
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 403) {
        console.error('You do not have permission to update this ticket')
      } else if (err.statusCode === 404) {
        console.error('Ticket not found')
      } else {
        console.error(err.message)
      }
    }
    throw err
  }
}
*/

// ============================================================================
// 5. DELETING A RESOURCE (DELETE)
// ============================================================================

/*
import { apiFetch, ApiError } from '@/lib/api'

async function deleteTicket(ticketId: string) {
  try {
    // Only IT_ADMIN can delete
    const result = await apiFetch(`/tickets/${ticketId}`, {
      method: 'DELETE',
    })
    return result
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 403) {
        console.error('Only IT_ADMIN can delete tickets')
      } else {
        console.error(err.message)
      }
    }
    throw err
  }
}
*/

// ============================================================================
// 6. PROTECTING ROUTES
// ============================================================================

/*
import { ProtectedRoute } from '@/components/protected-route'
import { EmployeePage } from './page'

export default function Layout() {
  return (
    <ProtectedRoute requiredRoles={['EMPLOYEE', 'HR', 'IT_SUPPORT', 'IT_ADMIN']}>
      <EmployeePage />
    </ProtectedRoute>
  )
}
*/

// ============================================================================
// 7. LOGOUT BUTTON
// ============================================================================

/*
import { useLogout } from '@/hooks/use-logout'

export function LogoutButton() {
  const { logout } = useLogout()

  return (
    <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded">
      Logout
    </button>
  )
}
*/

// ============================================================================
// 8. ERROR HANDLING BEST PRACTICES
// ============================================================================

/*
import { apiFetch, ApiError } from '@/lib/api'
import { useCallback, useState } from 'react'

function useApiWithErrorHandling<T>(
  endpoint: string,
  options?: RequestInit
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiFetch(endpoint, options)
      setData(result)
      return result
    } catch (err) {
      let errorMessage = 'An error occurred'

      if (err instanceof ApiError) {
        // Handle specific status codes
        switch (err.statusCode) {
          case 400:
            errorMessage = `Invalid request: ${err.message}`
            break
          case 401:
            errorMessage = 'Your session has expired. Please log in again.'
            break
          case 403:
            errorMessage = 'You do not have permission to access this resource.'
            break
          case 404:
            errorMessage = 'Resource not found.'
            break
          case 500:
            errorMessage = 'Server error. Please try again later.'
            break
          default:
            errorMessage = err.message
        }
      }

      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, options])

  return { data, loading, error, fetch }
}

// Usage
const { data: users, loading, error, fetch } = useApiWithErrorHandling('/users')
*/

// ============================================================================
// KEY POINTS TO REMEMBER
// ============================================================================

/**
 * 1. TOKEN STORAGE
 *    - Tokens are stored in localStorage with key 'authToken'
 *    - User data is stored with key 'authUser'
 *    - These are automatically managed by useAuth() hook
 *
 * 2. AUTOMATIC TOKEN INJECTION
 *    - Use apiFetch() instead of fetch() for API calls
 *    - apiFetch automatically adds Authorization header
 *    - Don't manually add Bearer token to headers
 *
 * 3. ERROR HANDLING
 *    - Always wrap apiFetch calls in try-catch
 *    - Check for ApiError to handle HTTP errors specifically
 *    - 401 errors trigger automatic redirect to login
 *    - 403 errors indicate insufficient permissions
 *
 * 4. AUTHENTICATION STATE
 *    - Use useAuth() hook to access user and token
 *    - Use ProtectedRoute for route protection
 *    - logout() function clears localStorage and redirects
 *
 * 5. API BASE URL
 *    - Base URL is http://localhost:3000 (NOT 3001)
 *    - Can be overridden with NEXT_PUBLIC_API_URL env var
 *    - Check API reference for correct endpoints
 *
 * 6. ROLE-BASED ACCESS
 *    - Check user.role for permissions
 *    - Use ProtectedRoute with requiredRoles array
 *    - Some endpoints check role server-side (HR, IT_ADMIN, etc.)
 */

export {}
