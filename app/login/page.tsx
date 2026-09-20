'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth'

function LoginForm() {
  const { login, isStaff, user } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/dashboard'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && isStaff) router.replace(next)
  }, [user, isStaff, router, next])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      router.push(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md border border-border bg-white p-8 shadow-sm">
      <h1 className="font-display text-3xl font-semibold mb-2">Staff login</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Sign in with a Django staff or superuser account to open the admin dashboard.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1.5">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full border border-border bg-input px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full border border-border bg-input px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-xs text-muted-foreground mt-6">
        Need an account? Create one with{' '}
        <code className="text-foreground">python manage.py createsuperuser</code> in{' '}
        <code className="text-foreground">poperty-backend</code>.{' '}
        <Link href="/" className="text-primary hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
