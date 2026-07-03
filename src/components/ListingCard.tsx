import Image from 'next/image'
import Link from 'next/link'
import { GasPump, Gauge, MapPin } from '@phosphor-icons/react/dist/ssr'
import type { ListingWithDetails } from '@/lib/types'
import { cn, formatMileage, formatPrice, label, timeAgo } from '@/lib/utils'

interface ListingCardProps {
  listing: ListingWithDetails
  className?: string
  priority?: boolean
}

export default function ListingCard({ listing, className, priority = false }: ListingCardProps) {
  const images = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)
  const cover = images[0]

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        'group block overflow-hidden rounded-lg border border-zinc-800 bg-[#141414]',
        'shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]',
        'transition-[box-shadow,transform] duration-200 ease-out',
        'hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-[2px]',
        'active:scale-[0.98]',
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        {cover ? (
          <Image
            src={cover.url}
            alt={listing.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-600">
            No photo
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-display text-base font-bold text-zinc-50">
          {listing.year} {listing.make} {listing.model}
        </h3>
        <p className="mt-1 text-lg font-bold text-accent">{formatPrice(listing.price)}</p>

        <div className="mt-2 flex items-center gap-4 text-xs text-zinc-400">
          {listing.mileage !== null && (
            <span className="flex items-center gap-1">
              <Gauge size={14} />
              {formatMileage(listing.mileage)}
            </span>
          )}
          {listing.fuel_type && (
            <span className="flex items-center gap-1">
              <GasPump size={14} />
              {label(listing.fuel_type)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{listing.location ?? 'Location not set'}</span>
          </span>
          <span className="shrink-0 font-mono">{timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
