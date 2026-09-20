'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import { PropertyCardSkeleton } from '@/components/PropertyCardSkeleton'
import { getMeta, getProperties, getTestimonials } from '@/lib/api'
import type { Property, PropertyCategory, Testimonial } from '@/lib/types'

const CATEGORY_IMAGES: Record<string, string> = {
  house: '/properties/house-luxury.png',
  apartment: '/properties/apartment-modern.png',
  land: '/properties/land-residential.png',
  commercial: '/properties/commercial-prime.png',
  office: '/properties/office-executive.png',
  warehouse: '/properties/warehouse-industrial.png',
  car: '/properties/car-camry-1.jpg',
}

const DEFAULT_CATEGORIES: PropertyCategory[] = [
  { id: 'house', name: 'Houses', icon: '🏠' },
  { id: 'apartment', name: 'Apartments', icon: '🏢' },
  { id: 'land', name: 'Lands', icon: '🌳' },
  { id: 'commercial', name: 'Commercial', icon: '🏬' },
  { id: 'office', name: 'Offices', icon: '💼' },
  { id: 'warehouse', name: 'Warehouses', icon: '📦' },
  { id: 'car', name: 'Cars', icon: '🚗' },
]

const DEFAULT_CITIES = ['Accra', 'Tema', 'Kumasi', 'Sekondi-Takoradi', 'Cape Coast']

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [propertyCategories, setPropertyCategories] =
    useState<PropertyCategory[]>(DEFAULT_CATEGORIES)
  const [cities, setCities] = useState<string[]>(DEFAULT_CITIES)
  const [listingsLoading, setListingsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [all, testimonialList, meta] = await Promise.all([
          getProperties(),
          getTestimonials(),
          getMeta(),
        ])
        if (cancelled) return
        setProperties(all)
        setTestimonials(testimonialList)
        setPropertyCategories(
          meta.propertyCategories?.length ? meta.propertyCategories : DEFAULT_CATEGORIES
        )
        setCities(meta.cities?.length ? meta.cities : DEFAULT_CITIES)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          const detail = err instanceof Error ? err.message : 'Unknown error'
          setError(`Could not load listings. ${detail}`)
        }
      } finally {
        if (!cancelled) setListingsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const featuredProperties = properties.filter(p => p.featured).slice(0, 6)
  const latestListings = [...properties].slice(0, 6)
  const cityCounts = cities.map(city => ({
    city,
    count: properties.filter(p => p.city.toLowerCase() === city.toLowerCase()).length,
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {error && (
        <div className="bg-destructive/10 text-destructive text-center px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <section className="relative min-h-[88svh] md:min-h-[92vh] overflow-hidden">
        <Image
          src="/hero-accra.jpg"
          alt="Residential street in Accra"
          fill
          className="object-cover home-hero-image"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2e1a]/80 via-[#143d24]/40 to-[#143d24]/25" />

        <div className="relative z-10 min-h-[88svh] md:min-h-[92vh] flex flex-col justify-end md:justify-center px-4 sm:px-6 lg:px-8 pb-16 md:pb-0">
          <div className="max-w-3xl w-full text-white">
            <p className="reveal font-display text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight mb-4">
              Mydas Plus
            </p>
            <h1 className="reveal reveal-delay-1 text-xl sm:text-2xl md:text-3xl font-medium text-white/95 max-w-xl">
              Homes, land &amp; more across Ghana
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Explore by type</h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Scroll through listing types — tap one to browse.
          </p>
        </div>

        <div className="category-rail flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 snap-x snap-mandatory">
          {propertyCategories.map(category => {
            const count = properties.filter(p => p.type === category.id).length
            const image = CATEGORY_IMAGES[category.id] || '/properties/house-luxury.png'
            return (
              <Link
                key={category.id}
                href={`/properties?type=${category.id}`}
                className="group relative shrink-0 w-[72vw] sm:w-56 md:w-64 aspect-[3/4] snap-start overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Image
                  src={image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 72vw, 256px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2e1a]/90 via-[#143d24]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-display text-2xl font-semibold leading-tight">{category.name}</p>
                  <p className="text-sm text-white/75 mt-1">
                    {listingsLoading ? '…' : `${count} ${count === 1 ? 'listing' : 'listings'}`}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-y border-border/80 bg-white/60 py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-2">Popular cities</h2>
          <p className="text-muted-foreground mb-8">Jump straight into a local market.</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-4">
            {cityCounts.map(({ city, count }) => (
              <li key={city}>
                <Link
                  href={`/properties?city=${encodeURIComponent(city)}`}
                  className="group inline-flex items-baseline gap-2 text-foreground hover:text-primary transition"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 translate-y-0.5" />
                  <span className="font-display text-xl md:text-2xl font-medium group-hover:underline underline-offset-4 decoration-primary/40">
                    {city}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {listingsLoading ? '…' : count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">Featured listings</h2>
            <p className="text-muted-foreground mt-2">Hand-picked places worth a closer look.</p>
          </div>
          <Link
            href="/properties"
            className="hidden sm:inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {listingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#0f2e1a] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold">Just listed</h2>
              <p className="text-white/65 mt-2">Fresh on the market.</p>
            </div>
            <Link
              href="/properties"
              className="hidden sm:inline-flex items-center gap-1 text-white/90 font-medium hover:underline"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestListings.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-2">What clients say</h2>
        <p className="text-muted-foreground mb-12 max-w-lg">
          Real stories from buyers and investors who found their match.
        </p>
        {listingsLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {testimonials.map(testimonial => (
              <blockquote
                key={testimonial.id}
                className="border-l-[3px] border-accent bg-white/70 pl-5 pr-4 py-4 rounded-r-xl"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < testimonial.rating ? 'fill-primary text-primary' : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <p className="font-display text-lg leading-relaxed text-foreground mb-6">
                  “{testimonial.content}”
                </p>
                <footer className="flex items-center gap-3">
                  <div className="relative w-10 h-10 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={testimonial.image || '/placeholder-user.jpg'}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <cite className="not-italic font-medium text-foreground">{testimonial.name}</cite>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2e1a] via-primary to-[#9bb82e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,232,74,0.35),_transparent_55%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
            Have a property to list?
          </h2>
          <p className="text-lg text-white/85 mb-8">
            Reach buyers and renters across Ghana with Mydas Plus.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 font-semibold hover:brightness-105 transition shadow-lg"
          >
            Start browsing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
