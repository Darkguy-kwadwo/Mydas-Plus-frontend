'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0f2e1a] text-white pt-16 pb-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="font-display text-2xl font-semibold mb-3">Mydas Plus</h3>
            <p className="text-white/75 leading-relaxed text-sm">
              Discover homes, land, and commercial spaces across Ghana — curated for buyers and
              renters who want clarity and speed.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2.5 text-white/80 text-sm">
              <li>
                <Link href="/" className="hover:text-accent transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-accent transition">
                  Properties
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-accent">Property Types</h4>
            <ul className="space-y-2.5 text-white/80 text-sm">
              {[
                ['house', 'Houses'],
                ['apartment', 'Apartments'],
                ['commercial', 'Commercial'],
                ['land', 'Land'],
                ['car', 'Cars'],
              ].map(([type, label]) => (
                <li key={type}>
                  <Link href={`/properties?type=${type}`} className="hover:text-accent transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-accent">Contact</h4>
            <ul className="space-y-3 text-white/80 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>+233 50 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>info@mydasplus.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>Accra, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} Mydas Plus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
