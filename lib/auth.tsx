'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearAuth, getStoredUser, loginRequest, logout as clearSession, type AuthUser } from '@/lib/auth-api'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isStaff: boolean
  login: (username: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const next = await loginRequest(username, password)
    setUser(next)
    return next
  }, [])

  const logout = useCallback(() => {
    clearSession()
    clearAuth()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isStaff: Boolean(user?.isStaff || user?.isSuperuser),
      login,
      logout,
    }),
    [user, loading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
