import type { Agent, BlogPost, Property, Testimonial } from './types'
import { getApiBase, isRemoteApi } from './api-base'
import { getAccessToken } from './auth-api'

export { getApiBase } from './api-base'

async function fetchOnce<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const timeoutMs = isRemoteApi(base) ? 25000 : 8000
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const method = (init?.method || 'GET').toUpperCase()
  const token = typeof window !== 'undefined' ? getAccessToken() : null
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    }
    if (token) headers.Authorization = `Bearer ${token}`
    if (method !== 'GET' && method !== 'HEAD' && !isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(`${base}${path}`, {
      ...init,
      method,
      signal: controller.signal,
      headers,
      cache: 'no-store',
    })

    if (!res.ok) {
      let detail = `API error ${res.status}: ${path}`
      try {
        const body = await res.json()
        if (typeof body?.detail === 'string') {
          detail = body.detail
        } else if (body && typeof body === 'object') {
          const parts: string[] = []
          for (const [key, value] of Object.entries(body)) {
            if (Array.isArray(value)) parts.push(`${key}: ${value.join(' ')}`)
            else if (typeof value === 'string') parts.push(`${key}: ${value}`)
            else parts.push(`${key}: ${JSON.stringify(value)}`)
          }
          if (parts.length) detail = parts.join(' · ')
        }
      } catch {
        /* ignore */
      }
      throw new Error(detail)
    }

    if (res.status === 204) return undefined as T
    return await res.json()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `API timed out after ${timeoutMs / 1000}s (${path}). ${
          isRemoteApi(base) ? 'The Render backend may be waking up — refresh in a moment.' : 'Is Django running on :8000?'
        }`
      )
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase()

  try {
    return await fetchOnce<T>(base, path, init)
  } catch (err) {
    if (isRemoteApi(base) && err instanceof Error && /timed out|Failed to fetch|NetworkError/i.test(err.message)) {
      return await fetchOnce<T>(base, path, init)
    }
    throw err
  }
}

export type PropertyFilters = {
  type?: string | null
  city?: string | null
  featured?: boolean
  agentId?: string | null
  forSale?: boolean
  forRent?: boolean
  minPrice?: number
  maxPrice?: number
  bedrooms?: number | null
  search?: string
}

function toQuery(filters: PropertyFilters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export async function getProperties(filters: PropertyFilters = {}) {
  return apiFetch<Property[]>(`/properties/${toQuery(filters)}`)
}

export async function getProperty(id: string) {
  return apiFetch<Property>(`/properties/${id}/`)
}

export async function getComparableProperties(id: string) {
  return apiFetch<Property[]>(`/properties/${id}/comparables/`)
}

export async function getAgents() {
  return apiFetch<Agent[]>('/agents/')
}

export async function getAgent(id: string) {
  return apiFetch<Agent>(`/agents/${id}/`)
}

export async function getBlogPosts(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch<BlogPost[]>(`/blog-posts/${qs}`)
}

export async function getBlogPost(id: string) {
  return apiFetch<BlogPost>(`/blog-posts/${id}/`)
}

export async function getTestimonials() {
  return apiFetch<Testimonial[]>('/testimonials/')
}

export async function getMeta() {
  return apiFetch<{
    cities: string[]
    propertyCategories: { id: string; name: string; icon: string }[]
  }>('/meta/')
}

export async function getAdminStats() {
  return apiFetch<{
    properties: number
    agents: number
    blogPosts: number
    testimonials: number
    featured: number
    forSale: number
    forRent: number
  }>('/admin/stats/')
}

export async function createResource<T>(path: string, body: FormData | Record<string, unknown>) {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  })
}

export async function updateResource<T>(path: string, body: FormData | Record<string, unknown>) {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  })
}

export async function deleteResource(path: string) {
  return apiFetch<void>(path, { method: 'DELETE' })
}
