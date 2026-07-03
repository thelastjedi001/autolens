import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CalendarBlank,
  CarSimple,
  Eye,
  GasPump,
  Gauge,
  GearSix,
  MapPin,
  PaintBucket,
  SealCheck,
} from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/lib/supabase/server'
import type { ListingWithDetails } from '@/lib/types'
import ImageGallery from '@/components/ImageGallery'
import ContactSeller from '@/components/ContactSeller'
import { formatMileage, formatPrice, initials, label, timeAgo } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('listings')
    .select('title')
    .eq('id', params.id)
    .maybeSingle()
  return { title: data?.title ?? 'Listing' }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_images(*), profiles(*)')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !data) notFound()

  const listing = data as unknown as ListingWithDetails
  const seller = listing.profiles

  // Fire-and-forget view counter; a failure here should never break the page
  supabase.rpc('increment_views', { listing: listing.id }).then(() => {})

  const pills: { icon: React.ReactNode; text: string }[] = []
  if (listing.mileage !== null) {
    pills.push({ icon: <Gauge size={15} />, text: formatMileage(listing.mileage) })
  }
  if (listing.fuel_type) {
    pills.push({ icon: <GasPump size={15} />, text: label(listing.fuel_type) })
  }
  if (listing.transmission) {
    pills.push({ icon: <GearSix size={15} />, text: label(listing.transmission) })
  }

  const specs = [
    { name: 'Colour', value: listing.colour ?? 'Not specified', icon: <PaintBucket size={15} /> },
    {
      name: 'Body type',
      value: listing.body_type ? label(listing.body_type) : 'Not specified',
      icon: <CarSimple size={15} />,
    },
    { name: 'Condition', value: label(listing.condition), icon: <SealCheck size={15} /> },
    {
      name: 'Listed',
      value: new Date(listing.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      icon: <CalendarBlank size={15} />,
    },
    { name: 'Views', value: String(listing.views + 1), icon: <Eye size={15} /> },
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      {listing.status !== 'active' && (
        <p className="mb-6 rounded-md border border-zinc-800 bg-[#141414] px-4 py-3 text-sm text-zinc-400">
          This listing is marked {label(listing.status)} and is only visible to you.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Gallery: 60% on desktop */}
        <div className="lg:col-span-3">
          <ImageGallery images={listing.listing_images ?? []} title={listing.title} />
        </div>

        {/* Summary column */}
        <div className="lg:col-span-2">
          <h1 className="font-display text-3xl font-bold leading-none tracking-tighter text-zinc-50 md:text-5xl">
            {listing.year} {listing.make}
            <br />
            {listing.model}
          </h1>
          <p className="mt-4 font-display text-3xl font-bold text-accent">
            {formatPrice(listing.price)}
          </p>

          {pills.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {pills.map((pill) => (
                <span
                  key={pill.text}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400"
                >
                  {pill.icon}
                  {pill.text}
                </span>
              ))}
            </div>
          )}

          {listing.location && (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-zinc-400">
              <MapPin size={16} />
              {listing.location}
            </p>
          )}

          {/* Seller card */}
          <div className="mt-8 rounded-lg border border-zinc-800 bg-[#141414] p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-50">
                {initials(seller.full_name) || 'S'}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-50">
                  {seller.account_type === 'dealer' && seller.dealer_name
                    ? seller.dealer_name
                    : seller.full_name || 'Seller'}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    {seller.account_type === 'dealer' ? 'Dealer' : 'Private'}
                  </span>
                  {seller.location && (
                    <span className="truncate text-xs text-zinc-400">{seller.location}</span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Member since{' '}
              {new Date(seller.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <div className="mt-4 space-y-2">
              <ContactSeller listingId={listing.id} sellerId={seller.id} />
              <Link
                href={`/profile/${seller.id}`}
                className="block rounded-md border border-zinc-800 px-4 py-2.5 text-center text-sm text-zinc-400 transition-colors duration-150 hover:border-zinc-700 hover:text-zinc-50 active:scale-[0.98]"
              >
                View profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Specs grid */}
      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl font-bold tracking-tighter text-zinc-50">Details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800 sm:grid-cols-2">
          {specs.map((spec) => (
            <div key={spec.name} className="flex items-center justify-between bg-[#141414] px-4 py-3">
              <dt className="flex items-center gap-2 text-sm text-zinc-400">
                {spec.icon}
                {spec.name}
              </dt>
              <dd className="text-sm text-zinc-50">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Description */}
      {listing.description && (
        <section className="mt-10 max-w-3xl">
          <h2 className="font-display text-xl font-bold tracking-tighter text-zinc-50">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-zinc-400">
            {listing.description}
          </p>
        </section>
      )}
    </div>
  )
}
