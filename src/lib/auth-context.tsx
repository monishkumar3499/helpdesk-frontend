'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export type UserRole = 'EMPLOYEE' | 'HR' | 'IT_SUPPORT' | 'IT_ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {

  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth from localStorage
  useEffect(() => {

    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Auth parse error:", error)

        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
    }

    setLoading(false)

  }, [])

  function login(newToken: string, newUser: User) {

    console.log("🔐 Login success")

    localStorage.setItem('authToken', newToken)
    localStorage.setItem('authUser', JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)
  }

  function logout() {

    console.log("🚪 Logout")

    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')

    setToken(null)
    setUser(null)

    router.replace('/login')
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {

  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}