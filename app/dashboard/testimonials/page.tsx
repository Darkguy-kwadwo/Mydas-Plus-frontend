'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createResource, deleteResource, getTestimonials, updateResource } from '@/lib/api'
import type { Testimonial } from '@/lib/types'

const empty = { name: '', role: '', content: '', rating: '5' }

export default function DashboardTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [form, setForm] = useState(empty)
  const [image, setImage] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setItems(await getTestimonials())
  }

  useEffect(() => {
    load().catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = new FormData()
      body.set('name', form.name)
      body.set('role', form.role)
      body.set('content', form.content)
      body.set('rating', form.rating)
      if (image) body.set('image', image)
      if (editingId) await updateResource(`/testimonials/${editingId}/`, body)
      else await createResource('/testimonials/', body)
      setEditingId(null)
      setForm(empty)
      setImage(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Testimonials</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage client quotes.</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <form onSubmit={onSubmit} className="bg-white border border-border p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input required placeholder="Client name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
          <input required placeholder="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
          <input required type="number" min={1} max={5} placeholder="Rating" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="border border-border px-3 py-2 bg-input" />
        </div>
        <textarea required rows={4} placeholder="Quote" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full border border-border px-3 py-2 bg-input" />
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-4 py-2.5 disabled:opacity-60">
            {saving ? 'Saving…' : editingId ? 'Update testimonial' : 'Add testimonial'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="border border-border px-4 py-2.5">
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Role</th>
              <th className="px-3 py-2.5">Rating</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-3 py-2.5 font-medium">{t.name}</td>
                <td className="px-3 py-2.5">{t.role}</td>
                <td className="px-3 py-2.5">{t.rating}</td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    className="text-primary mr-3"
                    onClick={() => {
                      setEditingId(t.id)
                      setForm({ name: t.name, role: t.role, content: t.content, rating: String(t.rating) })
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-destructive"
                    onClick={async () => {
                      if (!confirm('Delete this testimonial?')) return
                      await deleteResource(`/testimonials/${t.id}/`)
                      await load()
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
