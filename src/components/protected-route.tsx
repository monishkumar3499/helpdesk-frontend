'use client'

import { useAuth } from '@/lib/auth-context'
import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
}

/**
 * Wrapper component to protect routes
 * Redirects to login if not authenticated
 * Optionally checks for required roles
 */
export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      router.push('/unauthorized')
      return
    }
  }, [isAuthenticated, loading, user, requiredRoles, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
