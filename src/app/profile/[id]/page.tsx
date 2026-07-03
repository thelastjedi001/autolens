import { notFound } from 'next/navigation'
import { CalendarBlank, MapPin, Phone } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/lib/supabase/server'
import type { ListingWithDetails, Profile } from '@/lib/types'
import ListingCard from '@/components/ListingCard'
import { initials } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('full_name, dealer_name, account_type')
    .eq('id', params.id)
    .maybeSingle()
  const name =
    data?.account_type === 'dealer' && data.dealer_name
      ? data.dealer_name
      : data?.full_name || 'Profile'
  return { title: name }
}

export default async function ProfilePage({ params }: PageProps) {
  const supabase = createClient()

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (profileError || !profileData) notFound()

  const profile = profileData as Profile

  const { data: listingsData, error: listingsError } = await supabase
    .from('listings')
    .select('*, listing_images(*), profiles(*)')
    .eq('seller_id', profile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const listings = (listingsError || !listingsData
    ? []
    : listingsData) as unknown as ListingWithDetails[]

  const displayName =
    profile.account_type === 'dealer' && profile.dealer_name
      ? profile.dealer_name
      : profile.full_name || 'Seller'

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      {/* Profile header */}
      <div className="flex flex-col gap-5 border-b border-zinc-800 pb-8 md:flex-row md:items-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-display text-xl font-bold text-zinc-50">
          {initials(profile.full_name) || 'S'}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tighter text-zinc-50 md:text-4xl">
              {displayName}
            </h1>
            <span className="rounded bg-zinc-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              {profile.account_type === 'dealer' ? 'Dealer' : 'Private seller'}
            </span>
          </div>
          {profile.account_type === 'dealer' && profile.dealer_name && profile.full_name && (
            <p className="mt-1 text-sm text-zinc-400">Contact: {profile.full_name}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} />
                {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarBlank size={15} />
              Member since{' '}
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={15} />
                {profile.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active listings */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold tracking-tighter text-zinc-50">
          Active listings ({listings.length})
        </h2>
        {listings.length === 0 ? (
          <div className="mt-4 rounded-lg border border-zinc-800 bg-[#141414] p-12 text-center">
            <p className="text-sm text-zinc-400">No active listings right now.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
