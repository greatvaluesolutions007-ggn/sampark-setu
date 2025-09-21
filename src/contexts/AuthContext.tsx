import { createContext, useContext, useMemo, useState, useEffect, type JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '@/api/services'
import type { User } from '@/types'

type AuthContextValue = {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth') === '1'
  })
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const hasAuth = localStorage.getItem('auth') === '1'
      const hasToken = localStorage.getItem('token')
      
      if (hasAuth && hasToken) {
        try {
          setIsLoading(true)
          const response = await authService.getCurrentUser()
          if (!response.success) {
            throw new Error(response.message || 'Failed to get user data')
          }
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (error) {
          // Token is invalid, clear auth data
          localStorage.removeItem('auth')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('userRole')
          localStorage.removeItem('regionId')
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  // Listen for auth-logout events from axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null)
      setIsAuthenticated(false)
    }

    window.addEventListener('auth-logout', handleAuthLogout)
    
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    user,
    isLoading,
    login: async (email: string) => {
      localStorage.setItem('auth', '1')
      localStorage.setItem('user', email)
      setIsAuthenticated(true)
      
      // Fetch user data after login
      try {
        const response = await authService.getCurrentUser()
        if (!response.success) {
          throw new Error(response.message || 'Failed to get user data')
        }
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch user data after login:', error)
      }
    },
    logout: () => {
      localStorage.removeItem('auth')
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('regionId')
      setUser(null)
      setIsAuthenticated(false)
    }
  }), [isAuthenticated, user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">लोड हो रहा है...</p>
        </div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
