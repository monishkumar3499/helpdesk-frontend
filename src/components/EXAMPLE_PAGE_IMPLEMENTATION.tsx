/**
 * EXAMPLE COMPONENT - Complete Page Implementation
 * 
 * This file demonstrates best practices for:
 * - Using authentication
 * - Making API calls
 * - Error handling
 * - Loading states
 * - Role-based access control
 * 
 * Use this as a template for other pages/components.
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiFetch, ApiError } from '@/lib/api'
import { useLogout } from '@/hooks/use-logout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Ticket {
  id: string
  title: string
  summary: string
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'RESOLVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  department: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
  }
}

/**
 * Example Dashboard Component
 * Demonstrates:
 * - useAuth() for user information
 * - apiFetch() for API calls
 * - Error handling with ApiError
 * - Loading and error states
 * - Role-based rendering
 */
export function ExampleDashboard() {
  // ============================================================
  // 1. AUTHENTICATION STATE
  // ============================================================
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const { logout: handleLogout } = useLogout()

  // ============================================================
  // 2. COMPONENT STATE
  // ============================================================
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // 3. FETCH DATA ON MOUNT
  // ============================================================
  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) return

    // Don't fetch if not authenticated
    if (!isAuthenticated) return

    const fetchTickets = async () => {
      try {
        setLoading(true)
        setError(null)

        // API call with automatic token injection
        // The apiFetch function will:
        // - Add Bearer token from localStorage
        // - Parse JSON response
        // - Throw ApiError on failures
        // - Auto-redirect on 401
        const data = await apiFetch('/tickets')
        setTickets(data || [])
      } catch (err) {
        if (err instanceof ApiError) {
          // Handle specific API errors
          if (err.statusCode === 403) {
            setError('You do not have permission to view tickets')
          } else if (err.statusCode === 404) {
            setError('Tickets endpoint not found')
          } else {
            setError(`Error: ${err.message}`)
          }
        } else if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unexpected error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [authLoading, isAuthenticated])

  // ============================================================
  // 4. LOADING STATE
  // ============================================================
  if (authLoading) {
    return <div className="p-4 text-center">Loading authentication...</div>
  }

  if (!isAuthenticated) {
    return <div className="p-4 text-center">Please log in</div>
  }

  // ============================================================
  // 5. RENDER COMPONENT
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header with User Info */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Welcome, <span className="font-semibold">{user?.name}</span> (
            <span className="text-slate-500">{user?.role}</span>)
          </p>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        >
          Logout
        </Button>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-semibold">Name:</span> {user?.name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {user?.role}
          </p>
          <p>
            <span className="font-semibold">ID:</span> {user?.id}
          </p>
        </CardContent>
      </Card>

      {/* Role-Based Content */}
      {user?.role === 'IT_ADMIN' && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Admin Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">
              You have admin access to all features
            </p>
          </CardContent>
        </Card>
      )}

      {user?.role === 'EMPLOYEE' && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Employee Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800">
              Manage your personal tickets and assets
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tickets Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading tickets...</p>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-700 font-semibold">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-slate-500">No tickets found</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {ticket.summary}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                          {ticket.status}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            ticket.priority === 'URGENT'
                              ? 'bg-red-100 text-red-800'
                              : ticket.priority === 'HIGH'
                                ? 'bg-orange-100 text-orange-800'
                                : ticket.priority === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 border-t pt-3">
                    <p>
                      Created by {ticket.createdBy.name} on{' '}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                    {ticket.assignedTo && (
                      <p>Assigned to {ticket.assignedTo.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * ALTERNATIVE: Using the /tickets/mine endpoint
 * 
 * If you want to fetch only the current user's tickets,
 * replace `const data = await apiFetch('/tickets')` with:
 * 
 * const data = await apiFetch('/tickets/mine')
 */

/**
 * ALTERNATIVE: With Query Parameters
 * 
 * To filter tickets:
 * 
 * const openTickets = await apiFetch('/tickets?status=OPEN')
 * const highPriority = await apiFetch('/tickets?priority=HIGH')
 * const combined = await apiFetch('/tickets?status=OPEN&priority=URGENT')
 */

/**
 * ALTERNATIVE: Fetching Additional Data
 * 
 * To fetch user profile along with tickets:
 * 
 * const [profile, setProfile] = useState(null)
 * 
 * useEffect(() => {
 *   const fetchData = async () => {
 *     try {
 *       const userProfile = await apiFetch('/users/me/profile')
 *       const userTickets = await apiFetch('/tickets/mine')
 *       setProfile(userProfile)
 *       setTickets(userTickets)
 *     } catch (err) {
 *       setError('Failed to fetch data')
 *     }
 *   }
 *   fetchData()
 * }, [])
 */

export default ExampleDashboard
