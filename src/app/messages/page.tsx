import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChatCircle } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/lib/supabase/server'
import type { ConversationWithDetails } from '@/lib/types'
import { initials, timeAgo } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inbox',
}

export default async function MessagesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/messages')

  const { data, error } = await supabase
    .from('conversations')
    .select(
      `*,
      buyer:profiles!conversations_buyer_id_fkey(*),
      seller:profiles!conversations_seller_id_fkey(*),
      listing:listings(*, listing_images(*)),
      messages(*)`
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tighter text-zinc-50">Inbox</h1>
        <div className="mt-8 rounded-lg border border-zinc-800 bg-[#141414] p-12 text-center">
          <p className="text-sm text-red-400">Conversations failed to load: {error.message}</p>
        </div>
      </div>
    )
  }

  const conversations = (data ?? []) as unknown as ConversationWithDetails[]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-zinc-50">Inbox</h1>

      {conversations.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-lg border border-zinc-800 bg-[#141414] p-12 text-center">
          <ChatCircle size={32} className="text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">
            No conversations yet. Message a seller from any listing to start one.
          </p>
          <Link
            href="/listings"
            className="mt-5 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-zinc-800 overflow-hidden rounded-lg border border-zinc-800 bg-[#141414]">
          {conversations.map((conversation) => {
            const otherParty =
              conversation.buyer_id === user.id ? conversation.seller : conversation.buyer
            const sortedMessages = [...(conversation.messages ?? [])].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
            const lastMessage = sortedMessages[sortedMessages.length - 1]
            const unreadCount = sortedMessages.filter(
              (message) => !message.read && message.sender_id !== user.id
            ).length
            const cover = conversation.listing?.listing_images
              ?.slice()
              .sort((a, b) => a.position - b.position)[0]

            return (
              <li key={conversation.id}>
                <Link
                  href={`/messages/${conversation.id}`}
                  className="flex items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-zinc-900"
                >
                  {cover ? (
                    <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
                      <Image src={cover.url} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-50">
                      {initials(otherParty?.full_name ?? '') || '?'}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-zinc-50">
                        {otherParty?.account_type === 'dealer' && otherParty.dealer_name
                          ? otherParty.dealer_name
                          : otherParty?.full_name || 'Account removed'}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                        {timeAgo(conversation.last_message_at)}
                      </span>
                    </div>
                    {conversation.listing && (
                      <p className="truncate text-xs text-zinc-400">{conversation.listing.title}</p>
                    )}
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {lastMessage ? lastMessage.body : 'No messages yet'}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <span
                      className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-medium text-zinc-50"
                      aria-label={`${unreadCount} unread`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
