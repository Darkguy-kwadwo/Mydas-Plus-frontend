'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAgents } from '@/lib/api'
import type { Agent } from '@/lib/types'
import PropertyForm from '@/components/dashboard/PropertyForm'

export default function NewPropertyPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load agents'))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Add property</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create a listing with multiple photos and the same fields buyers see.
          </p>
        </div>
        <Link href="/dashboard/properties" className="text-sm text-primary hover:underline">
          Back to list
        </Link>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <PropertyForm mode="create" agents={agents} />
    </div>
  )
}
