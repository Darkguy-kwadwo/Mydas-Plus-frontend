'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Users,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/properties', label: 'Properties', icon: Building2 },
  { href: '/dashboard/agents', label: 'Agents', icon: Users },
  { href: '/dashboard/blog', label: 'Blog posts', icon: FileText },
  { href: '/dashboard/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isStaff, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user || !isStaff) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [loading, user, isStaff, router, pathname])

  if (loading || !user || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking staff access…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef4e4] text-foreground">
      <div className="border-b border-border bg-[#0f2e1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl font-semibold">Mydas Plus Admin</p>
            <p className="text-white/65 text-sm">Manage listings like Django admin</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-white/70">{user.username}</span>
            <Link href="/" className="hover:underline text-white/90">
              View site
            </Link>
            <button
              type="button"
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-3 py-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          {NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-primary text-primary-foreground' : 'hover:bg-white text-foreground/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
