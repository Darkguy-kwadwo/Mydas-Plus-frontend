'use client'

import { FormEvent, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ImagePlus, Trash2, X } from 'lucide-react'
import { createResource, updateResource } from '@/lib/api'
import type { Agent, Property } from '@/lib/types'

const PROPERTY_TYPES = [
  { id: 'house', label: 'House' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'land', label: 'Land' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'office', label: 'Office' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'car', label: 'Car' },
] as const

const CITIES = ['Accra', 'Tema', 'Kumasi', 'Sekondi-Takoradi', 'Cape Coast']

type FormState = {
  title: string
  description: string
  type: string
  price: string
  location: string
  city: string
  bedrooms: string
  bathrooms: string
  area: string
  featured: boolean
  agentId: string
  postedDate: string
  forSale: boolean
  forRent: boolean
  rentPrice: string
  features: string
}

function toForm(property?: Property | null): FormState {
  if (!property) {
    return {
      title: '',
      description: '',
      type: 'house',
      price: '',
      location: '',
      city: 'Accra',
      bedrooms: '',
      bathrooms: '',
      area: '0',
      featured: false,
      agentId: '',
      postedDate: new Date().toISOString().slice(0, 10),
      forSale: true,
      forRent: false,
      rentPrice: '',
      features: '',
    }
  }
  return {
    title: property.title,
    description: property.description,
    type: property.type,
    price: String(property.price),
    location: property.location,
    city: property.city,
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
    area: String(property.area ?? 0),
    featured: property.featured,
    agentId: property.agentId || '',
    postedDate: property.postedDate,
    forSale: property.forSale,
    forRent: property.forRent,
    rentPrice: property.rentPrice != null ? String(property.rentPrice) : '',
    features: (property.features || []).join(', '),
  }
}

type Props = {
  agents: Agent[]
  property?: Property | null
  mode: 'create' | 'edit'
}

export default function PropertyForm({ agents, property, mode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => toForm(property))
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainPreview, setMainPreview] = useState<string | null>(property?.image || null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [existingGallery, setExistingGallery] = useState(
    () => (property?.gallery || []).filter(g => !g.isMain)
  )
  const [removeGalleryIds, setRemoveGalleryIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isCar = form.type === 'car'
  const isLand = form.type === 'land'
  const showRooms = !isCar && !isLand

  const typeHint = useMemo(() => {
    if (isCar) return 'For cars, use Area as mileage (km) or leave 0. Skip bedrooms/bathrooms.'
    if (isLand) return 'For land, focus on location, size (m²), and description. Bedrooms/baths optional.'
    return 'Fill bedrooms, bathrooms, and size so the public listing matches the browse cards.'
  }, [isCar, isLand])

  function onMainChange(file: File | null) {
    setMainImage(file)
    if (mainPreview && mainPreview.startsWith('blob:')) URL.revokeObjectURL(mainPreview)
    setMainPreview(file ? URL.createObjectURL(file) : property?.image || null)
  }

  function onGalleryChange(files: FileList | null) {
    if (!files?.length) return
    const next = [...galleryFiles, ...Array.from(files)]
    setGalleryFiles(next)
    setGalleryPreviews(next.map(f => URL.createObjectURL(f)))
  }

  function removeNewGalleryAt(index: number) {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => {
      const url = prev[index]
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function removeExistingGallery(id: string) {
    setExistingGallery(prev => prev.filter(g => g.id !== id))
    if (/^\d+$/.test(id)) setRemoveGalleryIds(prev => [...prev, id])
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (!form.title.trim() || !form.description.trim() || !form.price || !form.location.trim()) {
        throw new Error('Title, description, price, and location are required.')
      }
      if (mode === 'create' && !mainImage && !mainPreview) {
        throw new Error('Add a main photo for this listing.')
      }

      const body = new FormData()
      body.set('title', form.title.trim())
      body.set('description', form.description.trim())
      body.set('type', form.type)
      body.set('price', form.price)
      body.set('location', form.location.trim())
      body.set('city', form.city)
      body.set('area', form.area || '0')
      body.set('featured', String(form.featured))
      body.set('postedDate', form.postedDate)
      body.set('forSale', String(form.forSale))
      body.set('forRent', String(form.forRent))
      if (form.agentId) body.set('agentId', form.agentId)
      if (form.rentPrice) body.set('rentPrice', form.rentPrice)
      if (showRooms && form.bedrooms) body.set('bedrooms', form.bedrooms)
      if (showRooms && form.bathrooms) body.set('bathrooms', form.bathrooms)
      body.set(
        'features',
        form.features
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .join(', ')
      )
      if (mainImage) body.set('image', mainImage)
      galleryFiles.forEach(file => body.append('gallery', file))
      if (removeGalleryIds.length) {
        body.set('removeGalleryIds', JSON.stringify(removeGalleryIds))
      }

      if (mode === 'edit' && property) {
        const updated = await updateResource<Property>(`/properties/${property.id}/`, body)
        router.push(`/dashboard/properties/${updated.id}`)
        router.refresh()
      } else {
        const created = await createResource<Property>('/properties/', body)
        router.push(`/dashboard/properties/${created.id}`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="rounded-xl border border-border bg-white p-5 space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Listing basics</h2>
          <p className="text-sm text-muted-foreground mt-1">{typeHint}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
              placeholder="e.g. Luxury Modern House with Pool"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Category</span>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
            >
              {PROPERTY_TYPES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Posted date</span>
            <input
              required
              type="date"
              value={form.postedDate}
              onChange={e => setForm(f => ({ ...f, postedDate: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
              placeholder="Full listing description shown on the detail page"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 space-y-4">
        <h2 className="font-display text-xl font-semibold">Price & availability</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Sale price (GHS)</span>
            <input
              required
              type="number"
              min={0}
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Monthly rent (GHS)</span>
            <input
              type="number"
              min={0}
              value={form.rentPrice}
              onChange={e => setForm(f => ({ ...f, rentPrice: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
              placeholder="If available for rent"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary"
              checked={form.forSale}
              onChange={e => setForm(f => ({ ...f, forSale: e.target.checked }))}
            />
            For sale
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary"
              checked={form.forRent}
              onChange={e => setForm(f => ({ ...f, forRent: e.target.checked }))}
            />
            For rent
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary"
              checked={form.featured}
              onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
            />
            Featured on homepage
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 space-y-4">
        <h2 className="font-display text-xl font-semibold">Location & details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Neighborhood / area</span>
            <input
              required
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
              placeholder="e.g. East Legon"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">City</span>
            <select
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
            >
              {CITIES.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          {showRooms && (
            <>
              <label className="block">
                <span className="text-sm font-medium">Bedrooms</span>
                <input
                  type="number"
                  min={0}
                  value={form.bedrooms}
                  onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
                  className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Bathrooms</span>
                <input
                  type="number"
                  min={0}
                  value={form.bathrooms}
                  onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))}
                  className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
                />
              </label>
            </>
          )}
          <label className="block">
            <span className="text-sm font-medium">{isCar ? 'Mileage / area' : 'Size (m²)'}</span>
            <input
              type="number"
              min={0}
              value={form.area}
              onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Assigned agent</span>
            <select
              value={form.agentId}
              onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
            >
              <option value="">No agent</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Features / amenities</span>
            <input
              value={form.features}
              onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
              className="mt-1.5 w-full border border-border bg-input px-3 py-2.5 rounded-md"
              placeholder="Comma-separated, e.g. Swimming Pool, Garden, Parking"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Photos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add a main photo plus extra gallery images — same gallery buyers see on the listing page.
          </p>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-5">
          <div>
            <p className="text-sm font-medium mb-2">Main photo</p>
            <label className="relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary/40 bg-secondary/40 hover:bg-secondary">
              {mainPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainPreview} alt="Main preview" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground p-4 text-center">
                  <ImagePlus className="w-7 h-7 text-primary" />
                  Upload main photo
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => onMainChange(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-medium">Gallery images</p>
              <label className="btn-primary px-3 py-1.5 rounded-md text-sm cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                Add images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => onGalleryChange(e.target.files)}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {existingGallery.map(item => (
                <div key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                  <Image src={item.url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingGallery(item.id)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-destructive"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {galleryPreviews.map((url, index) => (
                <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewGalleryAt(index)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-destructive"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {!existingGallery.length && !galleryPreviews.length && (
                <div className="col-span-full rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No gallery images yet. Add several photos so the public listing can show a full gallery.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 rounded-md disabled:opacity-60">
          {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Publish listing'}
        </button>
        <button
          type="button"
          onClick={() => router.push(property ? `/dashboard/properties/${property.id}` : '/dashboard/properties')}
          className="border border-border px-5 py-2.5 rounded-md hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
