import { getApiBase } from './api-base'

export type AuthUser = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  isStaff: boolean
  isSuperuser: boolean
}

const ACCESS_KEY = 'pf_access_token'
const REFRESH_KEY = 'pf_refresh_token'
const USER_KEY = 'pf_auth_user'

export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function logout() {
  clearAuth()
}

function persistAuth(access: string, refresh: string, user: AuthUser) {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function loginRequest(username: string, password: string): Promise<AuthUser> {
  const base = getApiBase()
  const res = await fetch(`${base}/auth/login/`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.detail || `Login failed (${res.status})`)
  }
  persistAuth(data.access, data.refresh, data.user)
  return data.user as AuthUser
}
