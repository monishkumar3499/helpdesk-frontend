import { useAuth } from '@/lib/auth-context'

/**
 * Hook to handle logout functionality
 * Clears auth data and redirects to login
 */
export function useLogout() {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return { logout: handleLogout }
}
