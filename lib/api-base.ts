/**
 * Resolve the Django API base URL.
 * Prefer NEXT_PUBLIC_API_URL. On localhost without env, use local Django.
 */
export function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

  if (configured) {
    return configured
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1'
    const isPrivateLan =
      /^192\.168\.\d+\.\d+$/.test(hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)

    if (isLoopback) {
      return 'http://127.0.0.1:8000/api'
    }
    if (isPrivateLan) {
      return `${protocol}//${hostname}:8000/api`
    }
  }

  // Server-side local default
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8000/api'
  }

  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. Add it in Vercel env (Production) and redeploy, or in .env.local locally (e.g. https://poperty-listing-backend.onrender.com/api).'
  )
}

export function isRemoteApi(base: string) {
  return base.startsWith('https://') || (!base.includes('127.0.0.1') && !base.includes('localhost'))
}
