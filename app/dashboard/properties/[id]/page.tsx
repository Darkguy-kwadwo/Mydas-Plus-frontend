'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Bath,
  Bed,
  MapPin,
  Pencil,
  Ruler,
  Trash2,
} from 'lucide-react'
import { deleteResource, getAgent, getProperty } from '@/lib/api'
import type { Agent, Property } from '@/lib/types'
import { formatDate } from '@/lib/dateUtils'

export default function DashboardPropertyDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    async function load() {
      setLoading(true)
      try {
        const prop = await getProperty(params.id)
        setProperty(prop)
        setSelectedImage(0)
        if (prop.agentId) {
          setAgent(await getAgent(prop.agentId))
        } else {
          setAgent(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
        setProperty(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params?.id])

  async function onDelete() {
    if (!property || !confirm('Delete this property listing?')) return
    try {
      await deleteResource(`/properties/${property.id}/`)
      router.push('/dashboard/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

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

  const gallery =
    property.images?.length > 0
      ? property.images
      : property.image
        ? [property.image]
        : ['/placeholder.jpg']

  const displayPrice = property.forSale
    ? property.price >= 1000000
      ? `₵${(property.price / 1000000).toFixed(1)}M`
      : `₵${(property.price / 1000).toFixed(0)}K`
    : property.rentPrice
      ? `₵${(property.rentPrice / 1000).toFixed(0)}K/mo`
      : `₵${(property.price / 1000).toFixed(0)}K`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/properties" className="text-sm text-primary hover:underline">
            ← All listings
          </Link>
          <h1 className="font-display text-3xl font-semibold mt-2">{property.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Listing ID {property.id} · Posted {formatDate(property.postedDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/properties/${property.id}`}
            className="border border-border px-4 py-2 rounded-md text-sm hover:bg-secondary"
            target="_blank"
          >
            View on site
          </Link>
          <Link
            href={`/dashboard/properties/${property.id}/edit`}
            className="btn-primary px-4 py-2 rounded-md text-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 border border-destructive/30 text-destructive px-4 py-2 rounded-md text-sm hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="space-y-3">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted">
            <Image
              src={gallery[selectedImage] || gallery[0]}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
              {selectedImage + 1} / {gallery.length}
            </span>
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {gallery.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="font-display text-4xl font-semibold text-primary">{displayPrice}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {property.featured && (
                <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold uppercase">
                  Featured
                </span>
              )}
              {property.forSale && (
                <span className="rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold uppercase">
                  For sale
                </span>
              )}
              {property.forRent && (
                <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold uppercase">
                  For rent
                </span>
              )}
            </div>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {property.location}, {property.city}
                  </p>
                </div>
              </li>
              {property.bedrooms != null && (
                <li className="flex items-start gap-3">
                  <Bed className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </li>
              )}
              {property.bathrooms != null && (
                <li className="flex items-start gap-3">
                  <Bath className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </li>
              )}
              {property.area > 0 && (
                <li className="flex items-start gap-3">
                  <Ruler className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">
                      {property.type === 'car' ? 'Mileage / area' : 'Area'}
                    </p>
                    <p className="font-medium">
                      {property.area}
                      {property.type === 'car' ? '' : ' m²'}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-5 text-sm space-y-2">
            <h2 className="font-semibold text-primary">Listing details</h2>
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize text-right">{property.type}</span>
              <span className="text-muted-foreground">City</span>
              <span className="font-medium text-right">{property.city}</span>
              <span className="text-muted-foreground">Sale price</span>
              <span className="font-medium text-right">GHS {property.price.toLocaleString()}</span>
              {property.rentPrice != null && (
                <>
                  <span className="text-muted-foreground">Rent</span>
                  <span className="font-medium text-right">
                    GHS {property.rentPrice.toLocaleString()}/mo
                  </span>
                </>
              )}
              <span className="text-muted-foreground">Photos</span>
              <span className="font-medium text-right">{gallery.length}</span>
            </div>
          </div>

          {agent && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-sm text-muted-foreground mb-3">Listed by</p>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                  {agent.image && (
                    <Image src={agent.image} alt={agent.name} fill className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="font-display text-2xl font-semibold mb-3">About this listing</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {property.description}
        </p>
        {property.features?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Features & amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map(feature => (
                <span
                  key={feature}
                  className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
