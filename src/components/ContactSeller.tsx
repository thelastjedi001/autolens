'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChatCircle } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/AuthProvider'

interface ContactSellerProps {
  listingId: string
  sellerId: string
}

export default function ContactSeller({ listingId, sellerId }: ContactSellerProps) {
  const supabase = createClient()
  const { user } = useUser()
  const router = useRouter()
  const [working, setWorking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isOwnListing = user?.id === sellerId

  async function handleClick() {
    if (!user) {
      router.push(`/auth/login?next=/listings/${listingId}`)
      return
    }
    if (isOwnListing || working) return

    setWorking(true)
    setErrorMessage(null)

    // Reuse the existing conversation for this buyer + listing if there is one
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .maybeSingle()

    if (existing) {
      router.push(`/messages/${existing.id}`)
      return
    }

    const { data: created, error } = await supabase
      .from('conversations')
      .insert({ listing_id: listingId, buyer_id: user.id, seller_id: sellerId })
      .select('id')
      .single()

    if (error || !created) {
      setErrorMessage('Could not start the conversation. Try again.')
      setWorking(false)
      return
    }

    router.push(`/messages/${created.id}`)
  }

  if (isOwnListing) {
    return (
      <p className="rounded-md border border-zinc-800 px-4 py-2.5 text-center text-sm text-zinc-400">
        This is your listing
      </p>
    )
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={working}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ChatCircle size={18} />
        {working ? 'Opening conversation...' : 'Send message'}
      </button>
      {errorMessage && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
