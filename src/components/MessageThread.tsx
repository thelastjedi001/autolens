'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PaperPlaneRight } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'
import { cn, timeAgo } from '@/lib/utils'

interface MessageThreadProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}

export default function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
}: MessageThreadProps) {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Realtime: append new messages in this conversation as they arrive
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message
          setMessages((current) =>
            current.some((message) => message.id === incoming.id)
              ? current
              : [...current, incoming]
          )
          // Mark messages from the other party as read while the thread is open
          if (incoming.sender_id !== currentUserId) {
            supabase.from('messages').update({ read: true }).eq('id', incoming.id).then(() => {})
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, conversationId, currentUserId])

  // Keep the latest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    const body = draft.trim()
    if (!body || sending) return

    setSending(true)
    setSendError(null)

    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: currentUserId, body })
      .select()
      .single()

    if (error) {
      setSendError('Message failed to send. Try again.')
      setSending(false)
      return
    }

    const sent = data as unknown as Message
    setMessages((current) =>
      current.some((message) => message.id === sent.id) ? current : [...current, sent]
    )
    setDraft('')
    setSending(false)

    // Bump the conversation so the inbox sorts it to the top
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400">
              No messages yet. Ask a question about the car to get things going.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === currentUserId
            return (
              <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div className="max-w-[80%] sm:max-w-[65%]">
                  <div
                    className={cn(
                      'rounded-lg px-3.5 py-2.5 text-sm leading-relaxed',
                      isMine ? 'bg-accent text-zinc-50' : 'bg-zinc-800 text-zinc-50'
                    )}
                  >
                    {message.body}
                  </div>
                  <p
                    className={cn(
                      'mt-1 font-mono text-[10px] text-zinc-500',
                      isMine ? 'text-right' : 'text-left'
                    )}
                  >
                    {timeAgo(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <p className="px-4 pb-2 text-xs text-red-400" role="alert">
          {sendError}
        </p>
      )}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-800 p-3">
        <label htmlFor="message-input" className="sr-only">
          Write a message
        </label>
        <input
          id="message-input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message"
          className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PaperPlaneRight size={18} weight="bold" />
        </button>
      </form>
    </div>
  )
}
