'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { deleteResource, getProperties } from '@/lib/api'
import type { Property } from '@/lib/types'

function formatPrice(p: Property) {
  const sale = p.forSale ? `GHS ${p.price.toLocaleString()}` : null
  const rent =
    p.forRent && p.rentPrice != null ? `GHS ${p.rentPrice.toLocaleString()}/mo` : null
  if (sale && rent) return `${sale} · ${rent}`
  return sale || rent || `GHS ${p.price.toLocaleString()}`
}

export default function DashboardPropertiesPage() {
  const [items, setItems] = useState<Property[]>([])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setItems(await getProperties())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return items.filter(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      )
    })
  }, [items, query, typeFilter])

  async function onDelete(id: string) {
    if (!confirm('Delete this property listing?')) return
    try {
      await deleteResource(`/properties/${id}/`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Property listings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage listings the way they appear on the site — with photos and full details.
          </p>
        </div>
        <Link href="/dashboard/properties/new" className="btn-primary px-4 py-2.5 rounded-md">
          <Plus className="w-4 h-4" />
          Add property
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search title, city, location…"
            className="w-full border border-border bg-white pl-10 pr-3 py-2.5 rounded-md"
          />
        </label>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-border bg-white px-3 py-2.5 rounded-md"
        >
          <option value="all">All categories</option>
          {['house', 'apartment', 'land', 'commercial', 'office', 'warehouse', 'car'].map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left">
            <tr>
              <th className="px-3 py-3 font-semibold">Photo</th>
              <th className="px-3 py-3 font-semibold">Title</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">City</th>
              <th className="px-3 py-3 font-semibold">Price</th>
              <th className="px-3 py-3 font-semibold">Flags</th>
              <th className="px-3 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  Loading listings…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  No listings yet.{' '}
                  <Link href="/dashboard/properties/new" className="text-primary hover:underline">
                    Add your first property
                  </Link>
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-3 py-2.5">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
                      {(p.image || p.images?.[0]) && (
                        <Image
                          src={p.image || p.images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/dashboard/properties/${p.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.images?.length || 0} photo{(p.images?.length || 0) === 1 ? '' : 's'}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 capitalize">{p.type}</td>
                  <td className="px-3 py-2.5">{p.city}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{formatPrice(p)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && (
                        <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                          Featured
                        </span>
                      )}
                      {p.forSale && (
                        <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                          Sale
                        </span>
                      )}
                      {p.forRent && (
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                          Rent
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/dashboard/properties/${p.id}`}
                        className="p-2 rounded-md hover:bg-secondary"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/properties/${p.id}/edit`}
                        className="p-2 rounded-md hover:bg-secondary"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="p-2 rounded-md hover:bg-destructive/10 text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
