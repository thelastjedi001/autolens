import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/lib/supabase/server'
import type { ConversationWithDetails, Message } from '@/lib/types'
import MessageThread from '@/components/MessageThread'
import { formatPrice, initials } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Conversation',
}

interface PageProps {
  params: { id: string }
}

export default async function ConversationPage({ params }: PageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/auth/login?next=/messages/${params.id}`)

  const { data, error } = await supabase
    .from('conversations')
    .select(
      `*,
      buyer:profiles!conversations_buyer_id_fkey(*),
      seller:profiles!conversations_seller_id_fkey(*),
      listing:listings(*, listing_images(*))`
    )
    .eq('id', params.id)
    .maybeSingle()

  // RLS hides conversations the user is not part of, so a miss covers both
  // "does not exist" and "not yours"
  if (error || !data) notFound()

  const conversation = data as unknown as ConversationWithDetails

  const { data: messagesData } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })

  const messages = (messagesData ?? []) as unknown as Message[]

  // Mark messages from the other party as read on open
  const hasUnread = messages.some((message) => !message.read && message.sender_id !== user.id)
  if (hasUnread) {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversation.id)
      .neq('sender_id', user.id)
      .eq('read', false)
  }

  const otherParty = conversation.buyer_id === user.id ? conversation.seller : conversation.buyer
  const cover = conversation.listing?.listing_images
    ?.slice()
    .sort((a, b) => a.position - b.position)[0]

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col px-4 py-6 md:px-8">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Link
          href="/messages"
          aria-label="Back to inbox"
          className="rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-50"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-50">
          {initials(otherParty?.full_name ?? '') || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-50">
            {otherParty?.account_type === 'dealer' && otherParty.dealer_name
              ? otherParty.dealer_name
              : otherParty?.full_name || 'Account removed'}
          </p>
          <p className="text-xs text-zinc-400">
            {otherParty?.account_type === 'dealer' ? 'Dealer' : 'Private seller'}
          </p>
        </div>
      </div>

      {conversation.listing && (
        <Link
          href={`/listings/${conversation.listing.id}`}
          className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-800 bg-[#141414] p-3 transition-colors duration-150 hover:border-zinc-700"
        >
          {cover && (
            <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-900">
              <Image src={cover.url} alt="" fill sizes="64px" className="object-cover" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-50">
              {conversation.listing.title}
            </p>
            <p className="text-sm font-bold text-accent">
              {formatPrice(conversation.listing.price)}
            </p>
          </div>
        </Link>
      )}

      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#141414]">
        <MessageThread
          conversationId={conversation.id}
          currentUserId={user.id}
          initialMessages={messages.map((message) =>
            message.sender_id !== user.id ? { ...message, read: true } : message
          )}
        />
      </div>
    </div>
  )
}
