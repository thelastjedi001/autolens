import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { BodyType, FuelType, ListingWithDetails } from '@/lib/types'
import { BODY_TYPES, FUEL_TYPES } from '@/lib/utils'
import ListingCard from '@/components/ListingCard'
import FilterSidebar from '@/components/FilterSidebar'
import SkeletonCard from '@/components/SkeletonCard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Browse listings',
}

interface SearchParams {
  [key: string]: string | string[] | undefined
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function many(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  return []
}

const SORT_OPTIONS = [
  { value: 'newest', name: 'Newest' },
  { value: 'price_asc', name: 'Price: low to high' },
  { value: 'price_desc', name: 'Price: high to low' },
  { value: 'mileage_asc', name: 'Mileage: low to high' },
] as const

async function ListingResults({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  let query = supabase
    .from('listings')
    .select('*, listing_images(*), profiles(*)', { count: 'exact' })
    .eq('status', 'active')

  const make = first(searchParams.make)
  const model = first(searchParams.model)
  const minYear = first(searchParams.min_year)
  const maxYear = first(searchParams.max_year)
  const minPrice = first(searchParams.min_price)
  const maxPrice = first(searchParams.max_price)
  const fuelTypes = many(searchParams.fuel_type)
  const transmission = first(searchParams.transmission)
  const bodyTypes = many(searchParams.body_type)
  const q = first(searchParams.q)
  const sort = first(searchParams.sort) ?? 'newest'

  if (make) query = query.ilike('make', `%${make}%`)
  if (model) query = query.ilike('model', `%${model}%`)
  if (minYear && !Number.isNaN(Number(minYear))) query = query.gte('year', Number(minYear))
  if (maxYear && !Number.isNaN(Number(maxYear))) query = query.lte('year', Number(maxYear))
  if (minPrice && !Number.isNaN(Number(minPrice))) query = query.gte('price', Number(minPrice))
  if (maxPrice && !Number.isNaN(Number(maxPrice))) query = query.lte('price', Number(maxPrice))

  // Keep only values that exist in the schema's check constraints; this both
  // satisfies the typed client and drops junk from hand-edited URLs
  const validFuel = fuelTypes.filter((value): value is FuelType =>
    (FUEL_TYPES as readonly string[]).includes(value)
  )
  const validBody = bodyTypes.filter((value): value is BodyType =>
    (BODY_TYPES as readonly string[]).includes(value)
  )
  if (validFuel.length > 0) query = query.in('fuel_type', validFuel)
  if (transmission === 'manual' || transmission === 'automatic')
    query = query.eq('transmission', transmission)
  if (validBody.length > 0) query = query.in('body_type', validBody)
  if (q) {
    const term = q.replace(/[%,()]/g, ' ').trim()
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,make.ilike.%${term}%,model.ilike.%${term}%,location.ilike.%${term}%`
      )
    }
  }

  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (sort === 'mileage_asc')
    query = query.order('mileage', { ascending: true, nullsFirst: false })
  else query = query.order('created_at', { ascending: false })

  const { data, count, error } = await query.limit(60)

  if (error) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-[#141414] p-12 text-center">
        <p className="text-sm text-red-400">Listings failed to load: {error.message}</p>
        <Link href="/listings" className="mt-3 inline-block text-sm text-accent hover:underline">
          Try again
        </Link>
      </div>
    )
  }

  const listings = (data ?? []) as unknown as ListingWithDetails[]

  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-[#141414] p-12 text-center">
        <p className="text-sm text-zinc-400">No listings match your filters.</p>
        <Link href="/listings" className="mt-3 inline-block text-sm text-accent hover:underline">
          Clear filters
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="mb-4 text-sm text-zinc-400">
        {count ?? listings.length} result{(count ?? listings.length) === 1 ? '' : 's'}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  )
}

function ResultsSkeleton() {
  return (
    <>
      <div className="skeleton mb-4 h-4 w-24 rounded" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </>
  )
}

export default function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const sort = first(searchParams.sort) ?? 'newest'

  // Build sort links that preserve the rest of the query string
  const baseParams = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === 'sort' || value === undefined) return
    if (Array.isArray(value)) value.forEach((entry) => baseParams.append(key, entry))
    else baseParams.set(key, value)
  })

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tighter text-zinc-50 md:text-4xl">
          Browse listings
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {SORT_OPTIONS.map((option) => {
            const params = new URLSearchParams(baseParams.toString())
            if (option.value !== 'newest') params.set('sort', option.value)
            const href = params.toString() ? `/listings?${params.toString()}` : '/listings'
            const active = sort === option.value
            return (
              <Link
                key={option.value}
                href={href}
                className={
                  active
                    ? 'rounded-md border border-accent bg-accent/10 px-3 py-1.5 text-xs text-zinc-50'
                    : 'rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-50'
                }
              >
                {option.name}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterSidebar />
        <div className="min-w-0 flex-1">
          <Suspense key={JSON.stringify(searchParams)} fallback={<ResultsSkeleton />}>
            <ListingResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
