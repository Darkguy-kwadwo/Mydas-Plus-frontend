'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createResource, deleteResource, getBlogPosts, updateResource } from '@/lib/api'
import type { BlogPost } from '@/lib/types'

const empty = {
  title: '',
  excerpt: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  author: '',
  category: '',
}

export default function DashboardBlogPage() {
  const [items, setItems] = useState<BlogPost[]>([])
  const [form, setForm] = useState(empty)
  const [image, setImage] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setItems(await getBlogPosts())
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
      Object.entries(form).forEach(([k, v]) => body.set(k, v))
      if (image) body.set('image', image)
      if (editingId) await updateResource(`/blog-posts/${editingId}/`, body)
      else await createResource('/blog-posts/', body)
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
        <h1 className="font-display text-3xl font-semibold">Blog posts</h1>
        <p className="text-muted-foreground text-sm mt-1">Publish and edit articles.</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <form onSubmit={onSubmit} className="bg-white border border-border p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input required placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
          <input required placeholder="Author" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
          <input required placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
          <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="border border-border px-3 py-2 bg-input" />
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="md:col-span-2 border border-border px-3 py-2 bg-input" />
        </div>
        <textarea required rows={2} placeholder="Excerpt" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="w-full border border-border px-3 py-2 bg-input" />
        <textarea required rows={6} placeholder="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full border border-border px-3 py-2 bg-input" />
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-4 py-2.5 disabled:opacity-60">
            {saving ? 'Saving…' : editingId ? 'Update post' : 'Add post'}
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
              <th className="px-3 py-2.5">Title</th>
              <th className="px-3 py-2.5">Author</th>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {items.map(post => (
              <tr key={post.id} className="border-t border-border">
                <td className="px-3 py-2.5 font-medium">{post.title}</td>
                <td className="px-3 py-2.5">{post.author}</td>
                <td className="px-3 py-2.5">{post.date}</td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    className="text-primary mr-3"
                    onClick={() => {
                      setEditingId(post.id)
                      setForm({
                        title: post.title,
                        excerpt: post.excerpt,
                        content: post.content,
                        date: post.date,
                        author: post.author,
                        category: post.category,
                      })
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-destructive"
                    onClick={async () => {
                      if (!confirm('Delete this post?')) return
                      await deleteResource(`/blog-posts/${post.id}/`)
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
