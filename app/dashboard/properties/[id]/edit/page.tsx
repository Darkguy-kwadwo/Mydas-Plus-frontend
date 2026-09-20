'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getAgents, getProperty } from '@/lib/api'
import type { Agent, Property } from '@/lib/types'
import PropertyForm from '@/components/dashboard/PropertyForm'

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    Promise.all([getProperty(params.id), getAgents()])
      .then(([prop, agentList]) => {
        setProperty(prop)
        setAgents(agentList)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [params?.id])

  if (loading) {
    return <p className="text-muted-foreground">Loading listing…</p>
  }

  if (!property) {
    return (
      <div>
        <p className="text-destructive mb-3">{error || 'Property not found'}</p>
        <Link href="/dashboard/properties" className="text-primary hover:underline">
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Edit property</h1>
          <p className="text-muted-foreground text-sm mt-1">{property.title}</p>
        </div>
        <Link href={`/dashboard/properties/${property.id}`} className="text-sm text-primary hover:underline">
          View listing
        </Link>
      </div>
      <PropertyForm mode="edit" property={property} agents={agents} />
    </div>
  )
}
