'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAdminStats } from '@/lib/api'

const CARDS = [
  { key: 'properties', label: 'Properties', href: '/dashboard/properties' },
  { key: 'agents', label: 'Agents', href: '/dashboard/agents' },
  { key: 'blogPosts', label: 'Blog posts', href: '/dashboard/blog' },
  { key: 'testimonials', label: 'Testimonials', href: '/dashboard/testimonials' },
  { key: 'featured', label: 'Featured', href: '/dashboard/properties' },
  { key: 'forSale', label: 'For sale', href: '/dashboard/properties' },
  { key: 'forRent', label: 'For rent', href: '/dashboard/properties' },
] as const

export default function DashboardHomePage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load stats'))
  }, [])

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Overview of content managed in the API — same models as Django admin.
      </p>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(card => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white border border-border p-5 hover:border-primary/40 transition"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="font-display text-3xl font-semibold mt-2">
              {stats ? stats[card.key] ?? '—' : '…'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
