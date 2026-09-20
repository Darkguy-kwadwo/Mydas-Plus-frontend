'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import { getMeta, getProperties } from '@/lib/api'
import type { Property, PropertyCategory } from '@/lib/types'

function PropertiesPageContent() {
  const searchParams = useSearchParams()
  const typeFilter = searchParams.get('type')
  const cityFilter = searchParams.get('city')

  const [selectedType, setSelectedType] = useState<string | null>(typeFilter)
  const [selectedCity, setSelectedCity] = useState<string | null>(cityFilter)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])
  const [bedroomFilter, setBedroomFilter] = useState<number | null>(null)
  const [forSaleOnly, setForSaleOnly] = useState(false)
  const [forRentOnly, setForRentOnly] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyCategories, setPropertyCategories] = useState<PropertyCategory[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSelectedType(typeFilter)
  }, [typeFilter])

  useEffect(() => {
    setSelectedCity(cityFilter)
  }, [cityFilter])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [props, meta] = await Promise.all([
          getProperties({
            type: selectedType,
            city: selectedCity,
            bedrooms: bedroomFilter,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            forSale: forSaleOnly || undefined,
            forRent: forRentOnly || undefined,
          }),
          getMeta(),
        ])
        setProperties(props)
        setPropertyCategories(meta.propertyCategories)
        setCities(meta.cities)
      } catch (err) {
        console.error(err)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedType, selectedCity, priceRange, bedroomFilter, forSaleOnly, forRentOnly])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary mb-2">
              Listings
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
              Browse Properties
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Filter by type, city, and budget to find the right place — sale or rent.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border border-border shadow-sm sticky top-20 ring-1 ring-primary/10">
                <h3 className="font-bold text-lg mb-6 text-foreground">Filters</h3>

                <div className="mb-6">
                  <label className="font-semibold text-sm mb-3 block text-primary">Property Type</label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedType(null)}
                      className={`filter-chip ${!selectedType ? 'filter-chip-active' : 'filter-chip-idle'}`}
                    >
                      All Types
                    </button>
                    {propertyCategories.map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedType(cat.id)}
                        className={`filter-chip ${
                          selectedType === cat.id ? 'filter-chip-active' : 'filter-chip-idle'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-semibold text-sm mb-3 block text-primary">City</label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCity(null)}
                      className={`filter-chip ${!selectedCity ? 'filter-chip-active' : 'filter-chip-idle'}`}
                    >
                      All Cities
                    </button>
                    {cities.map(city => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`filter-chip ${
                          selectedCity === city ? 'filter-chip-active' : 'filter-chip-idle'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-semibold text-sm mb-3 block text-primary">Price Range</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="5000000"
                      step="50000"
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                      className="w-full accent-primary"
                    />
                    <div className="text-sm text-muted-foreground">
                      ₵0 - ₵{(priceRange[1] / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-semibold text-sm mb-3 block text-primary">Bedrooms</label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setBedroomFilter(null)}
                      className={`filter-chip ${!bedroomFilter ? 'filter-chip-active' : 'filter-chip-idle'}`}
                    >
                      Any
                    </button>
                    {[1, 2, 3, 4, 5].map(bed => (
                      <button
                        type="button"
                        key={bed}
                        onClick={() => setBedroomFilter(bed)}
                        className={`filter-chip ${
                          bedroomFilter === bed ? 'filter-chip-active' : 'filter-chip-idle'
                        }`}
                      >
                        {bed}+ Bedrooms
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-sm mb-3 block text-primary">Purpose</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={forSaleOnly}
                        onChange={e => setForSaleOnly(e.target.checked)}
                      />
                      <span className="text-sm">For Sale</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={forRentOnly}
                        onChange={e => setForRentOnly(e.target.checked)}
                      />
                      <span className="text-sm">For Rent</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-muted-foreground">
                  {loading ? 'Loading…' : (
                    <>
                      Showing{' '}
                      <span className="font-semibold text-foreground">{properties.length}</span>{' '}
                      {properties.length === 1 ? 'property' : 'properties'}
                    </>
                  )}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border border-border bg-white">
                      <div className="skeleton h-56" />
                      <div className="space-y-3 p-5">
                        <div className="skeleton h-5 w-3/4 rounded" />
                        <div className="skeleton h-4 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg">
                  <p className="text-xl text-muted-foreground mb-4">No properties match your criteria.</p>
                  <button
                    onClick={() => {
                      setSelectedType(null)
                      setSelectedCity(null)
                      setPriceRange([0, 5000000])
                      setBedroomFilter(null)
                      setForSaleOnly(false)
                      setForRentOnly(false)
                    }}
                    className="btn-primary px-6 py-2.5 rounded-lg"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
          <Footer />
        </div>
      }
    >
      <PropertiesPageContent />
    </Suspense>
  )
}
