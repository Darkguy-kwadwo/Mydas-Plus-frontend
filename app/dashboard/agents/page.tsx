'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createResource, deleteResource, getAgents, updateResource } from '@/lib/api'
import type { Agent } from '@/lib/types'

const empty = { name: '', phone: '', email: '', rating: '0', bio: '', properties: '0' }

export default function DashboardAgentsPage() {
  const [items, setItems] = useState<Agent[]>([])
  const [form, setForm] = useState(empty)
  const [image, setImage] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setItems(await getAgents())
  }

  useEffect(() => {
    load().catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  function startEdit(a: Agent) {
    setEditingId(a.id)
    setForm({
      name: a.name,
      phone: a.phone,
      email: a.email,
      rating: String(a.rating),
      bio: a.bio,
      properties: String(a.properties),
    })
    setImage(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = new FormData()
      body.set('name', form.name)
      body.set('phone', form.phone)
      body.set('email', form.email)
      body.set('rating', form.rating)
      body.set('bio', form.bio)
      body.set('properties', form.properties)
      if (image) body.set('image', image)
      if (editingId) await updateResource(`/agents/${editingId}/`, body)
      else await createResource('/agents/', body)
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
        <h1 className="font-display text-3xl font-semibold">Agents</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage agent profiles.</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <form onSubmit={onSubmit} className="bg-white border border-border p-5 grid md:grid-cols-2 gap-4">
        <input required placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
        <input required placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
        <input type="number" step="0.1" placeholder="Rating" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
        <input type="number" placeholder="Listed count" value={form.properties} onChange={e => setForm(f => ({ ...f, properties: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="border border-border px-3 py-2 bg-input" />
        <textarea rows={3} placeholder="Bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="md:col-span-2 border border-border px-3 py-2 bg-input" />
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-4 py-2.5 disabled:opacity-60">
            {saving ? 'Saving…' : editingId ? 'Update agent' : 'Add agent'}
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
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Phone</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-3 py-2.5 font-medium">{a.name}</td>
                <td className="px-3 py-2.5">{a.email}</td>
                <td className="px-3 py-2.5">{a.phone}</td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <button type="button" className="text-primary mr-3" onClick={() => startEdit(a)}>Edit</button>
                  <button
                    type="button"
                    className="text-destructive"
                    onClick={async () => {
                      if (!confirm('Delete this agent?')) return
                      await deleteResource(`/agents/${a.id}/`)
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
