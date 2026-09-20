'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick?: () => void
}) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative font-medium transition ${
        active ? 'text-primary' : 'text-foreground/75 hover:text-primary'
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-accent" aria-hidden />
      )}
    </Link>
  )
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isStaff, user, logout, loading } = useAuth()
  const close = () => setIsMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-[#f5f8ef]/90 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={close}>
          <Image
            src="/logo.svg"
            alt="Mydas Plus"
            width={180}
            height={54}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/properties">Properties</NavLink>
          {!loading && isStaff && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-foreground/75 hover:text-primary transition font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
          {!loading && user && (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 text-foreground/75 hover:text-primary transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(open => !open)}
          className="md:hidden p-2 rounded-md hover:bg-secondary transition"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/98 p-4 flex flex-col gap-4 shadow-lg">
          <NavLink href="/" onClick={close}>
            Home
          </NavLink>
          <NavLink href="/properties" onClick={close}>
            Properties
          </NavLink>
          {!loading && isStaff && (
            <Link
              href="/dashboard"
              onClick={close}
              className="inline-flex items-center gap-2 text-foreground hover:text-primary"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
          {!loading && user && (
            <button
              type="button"
              onClick={() => {
                logout()
                close()
              }}
              className="inline-flex items-center gap-2 text-left"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          )}
        </div>
      )}
    </header>
  )
}
