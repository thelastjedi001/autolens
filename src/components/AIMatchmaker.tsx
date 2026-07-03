'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUp, Car, Spinner, X } from '@phosphor-icons/react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant'

type Message = {
  id: string
  role: Role
  content: string
  recommendations?: Recommendation[]
}

type Recommendation = {
  rank: number
  make: string
  model: string
  yearRange: string
  budgetRange: string
  whyItFits: string
  bestTrim: string
  watchOut: string
  autotraderUrl: string
  carsDotComUrl: string
  imageQuery: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2)
}

function parseRecommendations(content: string): Recommendation[] | null {
  try {
    const match = content.match(/```json\s*([\s\S]*?)```/)
    if (!match) return null
    const parsed = JSON.parse(match[1])
    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return parsed.recommendations
    }
    return null
  } catch {
    return null
  }
}

// ─── Image URL builder ────────────────────────────────────────────────────────
// Builds a deterministic imagin.studio CDN render URL from the car's make,
// model and year. No fetch, no CORS, no JSON — the URL goes straight into <img>.
// 'img' is a shared demo customer key, so renders carry an imagin watermark.
// Swap for your own paid customer key to drop the watermark.

function carImageUrl(rec: Recommendation): string {
  const yearMatch = rec.yearRange.match(/\d{4}/)
  const params = new URLSearchParams({
    customer: 'img',
    make: rec.make.toLowerCase(),
    modelFamily: rec.model.split(' ')[0].toLowerCase(),
    zoomType: 'fullscreen',
    angle: '23',
  })
  if (yearMatch) params.set('modelYear', yearMatch[0])
  return `https://cdn.imagin.studio/getimage?${params.toString()}`
}

// Quick-reply chips shown at each stage
const QUICK_REPLIES: Record<string, string[]> = {
  budget: ['Under $15k', '$15k–$25k', '$25k–$40k', '$40k–$60k', 'Over $60k'],
  fuel: ['Petrol', 'Hybrid', 'Electric', 'No preference'],
  use: ['Daily commute', 'Family hauler', 'Weekend trips', 'Off-road / outdoors', 'Luxury / comfort'],
  priority: ['Reliability', 'Fuel economy', 'Space', 'Performance', 'Low cost of ownership'],
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AIMatchmaker() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'assistant',
      content: "Let's find your next car. What's your budget?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [chips, setChips] = useState<string[]>(QUICK_REPLIES.budget)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Send message ─────────────────────────────────────────────────────────────

  async function send(text: string) {
    if (!text.trim() || loading || done) return

    const userMsg: Message = { id: uid(), role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setChips([])

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()
      const rawContent = data.content?.[0]?.text ?? ''

      const recs = parseRecommendations(rawContent)

      if (recs) {
        const assistantMsg: Message = {
          id: uid(),
          role: 'assistant',
          content: rawContent,
          recommendations: recs,
        }
        setMessages((prev) => [...prev, assistantMsg])
        setDone(true)
      } else {
        const assistantMsg: Message = {
          id: uid(),
          role: 'assistant',
          content: rawContent,
        }
        setMessages((prev) => [...prev, assistantMsg])
        setChips(nextChips(rawContent, newMessages.length))
        inputRef.current?.focus()
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: 'Something went wrong. Try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // ── Chip logic ────────────────────────────────────────────────────────────────

  function nextChips(lastMessage: string, messageCount: number): string[] {
    const lower = lastMessage.toLowerCase()
    if (lower.includes('fuel') || lower.includes('electric') || lower.includes('petrol') || lower.includes('hybrid')) {
      return QUICK_REPLIES.fuel
    }
    if (lower.includes('use') || lower.includes('drive') || lower.includes('typical') || lower.includes('mainly')) {
      return QUICK_REPLIES.use
    }
    if (lower.includes('matter') || lower.includes('important') || lower.includes('priorit') || lower.includes('care about')) {
      return QUICK_REPLIES.priority
    }
    if (messageCount <= 2) return QUICK_REPLIES.budget
    return []
  }

  function reset() {
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        content: "Let's find your next car. What's your budget?",
      },
    ])
    setInput('')
    setDone(false)
    setChips(QUICK_REPLIES.budget)
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs font-mono text-blue-500 uppercase tracking-widest mb-3">
            Smart Matchmaker — AI
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100 leading-none">
            Tell us what you need.<br className="hidden md:block" />
            We'll find your car.
          </h2>
        </div>
        {done && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <X size={12} /> Start over
          </button>
        )}
      </div>

      {/* Chat window */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <div className="h-[380px] overflow-y-auto px-5 py-5 space-y-4 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {msg.recommendations ? (
                  <div className="text-xs text-zinc-600 font-mono py-2">
                    Recommendations ready — see below
                  </div>
                ) : (
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`
                        max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-zinc-800/70 text-zinc-200 rounded-bl-sm'
                        }
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-zinc-800/70 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Spinner size={16} className="text-zinc-500 animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Quick reply chips */}
        <AnimatePresence>
          {chips.length > 0 && !done && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pb-3 flex flex-wrap gap-2"
            >
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400 transition-colors active:scale-[0.97]"
                >
                  {chip}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        {!done && (
          <div className="border-t border-zinc-800 px-4 py-3 flex items-center gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Type your answer..."
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="shrink-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-[0.95]"
            >
              <ArrowUp size={14} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <AnimatePresence>
        {done && messages.some((m) => m.recommendations) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="mt-8"
          >
            <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-5">
              Your matches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {messages
                .find((m) => m.recommendations)
                ?.recommendations?.map((rec, i) => (
                  <RecommendationCard key={rec.rank} rec={rec} index={i} />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Recommendation card ──────────────────────────────────────────────────────

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const [imgError, setImgError] = useState(false)
  const imageUrl = carImageUrl(rec)

  const rankLabel = index === 0 ? 'Best fit' : index === 1 ? 'Alternative' : 'Wildcard'
  const rankColour =
    index === 0
      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900/50'
      : index === 1
      ? 'text-blue-400 bg-blue-950/50 border-blue-900/50'
      : 'text-amber-400 bg-amber-950/50 border-amber-900/50'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 bg-zinc-900 overflow-hidden flex items-center justify-center">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${rec.make} ${rec.model}`}
            className="w-full h-full object-contain p-2"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-700">
            <Car size={40} weight="thin" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${rankColour}`}>
            {rankLabel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-zinc-100 font-bold text-base leading-tight">
          {rec.make} {rec.model}
        </p>
        <p className="text-zinc-500 text-xs mt-0.5 mb-3">
          {rec.yearRange} · {rec.budgetRange}
        </p>

        <p className="text-zinc-400 text-sm leading-relaxed mb-3 flex-1">
          {rec.whyItFits}
        </p>

        <div className="space-y-2 mb-4">
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400 font-medium">Best trim: </span>
            {rec.bestTrim}
          </div>
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400 font-medium">Watch out: </span>
            {rec.watchOut}
          </div>
        </div>

        {/* Search links */}
        <div className="flex gap-2 mt-auto">
          <a
            href={rec.autotraderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            AutoTrader
          </a>
          <a
            href={rec.carsDotComUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Cars.com
          </a>
        </div>
      </div>
    </motion.div>
  )
}
