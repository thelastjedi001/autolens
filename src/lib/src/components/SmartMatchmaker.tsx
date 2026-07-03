'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { rankListings, type MatchPreferences, type ScoredListing } from '@/lib/matchmaker'
import {
  Car,
  Lightning,
  CurrencyDollar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  MagnifyingGlass,
  Star,
  X,
} from '@phosphor-icons/react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Step data ────────────────────────────────────────────────────────────────

const BODY_TYPES = [
  { value: 'sedan',  label: 'Sedan' },
  { value: 'suv',    label: 'SUV' },
  { value: 'truck',  label: 'Truck' },
  { value: 'coupe',  label: 'Coupe' },
  { value: 'van',    label: 'Van' },
  { value: 'any',    label: 'No preference' },
]

const FUEL_TYPES = [
  { value: 'petrol',   label: 'Petrol' },
  { value: 'hybrid',   label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
  { value: 'diesel',   label: 'Diesel' },
  { value: 'any',      label: 'No preference' },
]

const BUDGET_OPTIONS = [
  { value: 15000,  label: 'Under $15,000' },
  { value: 20000,  label: 'Under $20,000' },
  { value: 30000,  label: 'Under $30,000' },
  { value: 40000,  label: 'Under $40,000' },
  { value: 999999, label: 'No limit' },
]

const CONDITION_OPTIONS = [
  { value: 'used',      label: 'Used' },
  { value: 'certified', label: 'Certified pre-owned' },
  { value: 'new',       label: 'New' },
  { value: 'any',       label: 'No preference' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'body' | 'fuel' | 'budget' | 'condition' | 'results'

const STEPS: Step[] = ['body', 'fuel', 'budget', 'condition', 'results']

const STEP_META: Record<Exclude<Step, 'results'>, { icon: React.ReactNode; question: string }> = {
  body:      { icon: <Car size={20} weight="duotone" />,           question: "What type of car are you looking for?" },
  fuel:      { icon: <Lightning size={20} weight="duotone" />,     question: "What fuel type do you prefer?" },
  budget:    { icon: <CurrencyDollar size={20} weight="duotone" />, question: "What's your maximum budget?" },
  condition: { icon: <CheckCircle size={20} weight="duotone" />,   question: "What condition are you after?" },
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SmartMatchmaker() {
  const [currentStep, setCurrentStep] = useState<Step>('body')
  const [prefs, setPrefs] = useState<Partial<MatchPreferences>>({})
  const [results, setResults] = useState<ScoredListing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  const stepIndex = STEPS.indexOf(currentStep)

  // ── Navigation ──────────────────────────────────────────────────────────────

  function handleBack() {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1])
  }

  async function handleSelect(field: keyof MatchPreferences, value: unknown) {
    const updated = { ...prefs, [field]: value } as MatchPreferences

    setPrefs(updated)

    if (currentStep === 'condition') {
      // Last question — run the query
      await runMatch(updated)
    } else {
      setCurrentStep(STEPS[stepIndex + 1])
    }
  }

  // ── Supabase query + scoring ─────────────────────────────────────────────────

  async function runMatch(finalPrefs: MatchPreferences) {
    setLoading(true)
    setError(null)
    setCurrentStep('results')

    try {
      const supabase = createClient()

      // Pull all active listings with their primary image.
      // We score client-side after fetching — the dataset is small (15–100s of rows),
      // so this is fine. For a production scale with 10k+ listings you'd push
      // the budget filter to Supabase with .lte('price', maxBudget).
      let query = supabase
        .from('listings')
        .select(`
          id, title, make, model, year, price, mileage,
          fuel_type, transmission, body_type, colour,
          condition, description, location, views,
          listing_images ( url, position )
        `)
        .eq('status', 'active')
        .lte('price', finalPrefs.maxBudget)
        .order('created_at', { ascending: false })

      // Push body_type filter to DB if user picked something specific
      if (finalPrefs.bodyTypes && finalPrefs.bodyTypes.length > 0 && !finalPrefs.bodyTypes.includes('any')) {
        query = query.in('body_type', finalPrefs.bodyTypes)
      }

      // Push fuel filter to DB
      if (finalPrefs.fuelType && finalPrefs.fuelType !== 'any') {
        query = query.eq('fuel_type', finalPrefs.fuelType)
      }

      // Push condition filter to DB
      if (finalPrefs.condition && finalPrefs.condition !== 'any') {
        query = query.eq('condition', finalPrefs.condition)
      }

      const { data, error: dbError } = await query

      if (dbError) throw dbError

      // Shape the data for scoring
      const shaped = (data ?? []).map((row: any) => {
        const primaryImage = (row.listing_images ?? [])
          .sort((a: any, b: any) => a.position - b.position)[0]
        return {
          id:           row.id,
          title:        row.title,
          make:         row.make,
          model:        row.model,
          year:         row.year,
          price:        row.price,
          mileage:      row.mileage,
          fuel_type:    row.fuel_type,
          transmission: row.transmission,
          body_type:    row.body_type,
          colour:       row.colour,
          condition:    row.condition,
          description:  row.description,
          location:     row.location,
          views:        row.views,
          image_url:    primaryImage?.url ?? null,
        }
      })

      const ranked = rankListings(shaped, finalPrefs)
      setResults(ranked)
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Reset ────────────────────────────────────────────────────────────────────

  function reset() {
    setCurrentStep('body')
    setPrefs({})
    setResults([])
    setError(null)
    setLoading(false)
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (!started) {
    return <MatchmakerIntro onStart={() => setStarted(true)} />
  }

  return (
    <div className="w-full">
      {/* Progress bar */}
      {currentStep !== 'results' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Step {stepIndex + 1} of {STEPS.length - 1}
            </span>
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
          </div>
          <div className="h-px bg-zinc-800 w-full relative">
            <motion.div
              className="absolute inset-y-0 left-0 bg-blue-500"
              animate={{ width: `${((stepIndex + 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentStep !== 'results' ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <QuizStep
              step={currentStep as Exclude<Step, 'results'>}
              prefs={prefs}
              onSelect={handleSelect}
            />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ResultsPanel
              loading={loading}
              error={error}
              results={results}
              onReset={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Intro card ───────────────────────────────────────────────────────────────

function MatchmakerIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
      <div>
        <p className="text-xs font-mono text-blue-500 uppercase tracking-widest mb-3">
          Smart Matchmaker
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100 leading-none mb-4">
          Find your car<br className="hidden md:block" /> in 60 seconds.
        </h2>
        <p className="text-zinc-500 text-base leading-relaxed max-w-[52ch]">
          Answer four questions. We score every listing against your preferences and surface the best fits — no scrolling required.
        </p>
      </div>
      <button
        onClick={onStart}
        className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-medium px-7 py-4 rounded-xl transition-all duration-200 w-fit shrink-0"
      >
        <MagnifyingGlass size={18} />
        Start matching
        <ArrowRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </button>
    </div>
  )
}

// ─── Single quiz step ─────────────────────────────────────────────────────────

function QuizStep({
  step,
  prefs,
  onSelect,
}: {
  step: Exclude<Step, 'results'>
  prefs: Partial<MatchPreferences>
  onSelect: (field: keyof MatchPreferences, value: unknown) => void
}) {
  const meta = STEP_META[step]

  const options: { value: string | number; label: string }[] =
    step === 'body'
      ? BODY_TYPES
      : step === 'fuel'
      ? FUEL_TYPES
      : step === 'budget'
      ? BUDGET_OPTIONS
      : CONDITION_OPTIONS

  const currentValue =
    step === 'body'
      ? (prefs.bodyTypes?.[0] ?? null)
      : step === 'fuel'
      ? prefs.fuelType
      : step === 'budget'
      ? prefs.maxBudget
      : prefs.condition

  function handleClick(value: string | number) {
    if (step === 'body') {
      onSelect('bodyTypes', value === 'any' ? [] : [value as string])
    } else if (step === 'fuel') {
      onSelect('fuelType', value as string)
    } else if (step === 'budget') {
      onSelect('maxBudget', value as number)
    } else {
      onSelect('condition', value as string)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-blue-500 mb-4">
        {meta.icon}
        <span className="text-sm font-medium">{step.charAt(0).toUpperCase() + step.slice(1)}</span>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 mb-8">
        {meta.question}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((opt, i) => {
          const isSelected =
            step === 'body'
              ? (value: typeof opt.value) => prefs.bodyTypes?.includes(value as string) || (value === 'any' && prefs.bodyTypes?.length === 0)
              : (value: typeof opt.value) => currentValue === value

          const selected = isSelected(opt.value)

          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleClick(opt.value)}
              className={`
                relative px-5 py-4 rounded-xl border text-left text-sm font-medium
                transition-all duration-150 active:scale-[0.97]
                ${selected
                  ? 'border-blue-500 bg-blue-950/60 text-blue-300'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }
              `}
            >
              {selected && (
                <motion.span
                  layoutId="selected-indicator"
                  className="absolute top-2 right-2 text-blue-400"
                >
                  <CheckCircle size={14} weight="fill" />
                </motion.span>
              )}
              {opt.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Results panel ────────────────────────────────────────────────────────────

function ResultsPanel({
  loading,
  error,
  results,
  onReset,
}: {
  loading: boolean
  error: string | null
  results: ScoredListing[]
  onReset: () => void
}) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold tracking-tight text-zinc-100">Finding your matches…</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden animate-pulse">
              <div className="h-44 bg-zinc-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-center">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button onClick={onReset} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline">
          Try again
        </button>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 text-base mb-2">No listings matched your preferences.</p>
        <p className="text-zinc-600 text-sm mb-6">Try a higher budget or fewer filters.</p>
        <button
          onClick={onReset}
          className="text-sm text-blue-500 hover:text-blue-400 transition-colors underline"
        >
          Start over
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-zinc-100">
            {results.length} {results.length === 1 ? 'match' : 'matches'} found
          </h3>
          <p className="text-zinc-500 text-sm mt-0.5">Ranked by how well they fit your answers.</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors border border-zinc-800 px-3 py-1.5 rounded-lg"
        >
          <X size={12} /> Start over
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <MatchCard listing={listing} rank={index + 1} />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Browse all listings <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

// ─── Individual match card ────────────────────────────────────────────────────

function MatchCard({ listing, rank }: { listing: ScoredListing; rank: number }) {
  const scoreColour =
    listing.score >= 80
      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900/50'
      : listing.score >= 50
      ? 'text-blue-400 bg-blue-950/50 border-blue-900/50'
      : 'text-zinc-400 bg-zinc-900/50 border-zinc-800'

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden transition-all duration-200 hover:border-zinc-600 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.4)]">
        {/* Image */}
        <div className="relative h-44 bg-zinc-900 overflow-hidden">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-700">
              <Car size={40} weight="thin" />
            </div>
          )}

          {/* Rank badge */}
          <div className="absolute top-3 left-3">
            <span className="text-xs font-mono font-bold bg-zinc-950/80 backdrop-blur-sm text-zinc-300 px-2 py-1 rounded-md border border-zinc-700/50">
              #{rank}
            </span>
          </div>

          {/* Score badge */}
          <div className="absolute top-3 right-3">
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${scoreColour}`}>
              <Star size={11} weight="fill" />
              {listing.score}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-zinc-100 font-semibold text-sm leading-tight mb-1">{listing.title}</p>
          <p className="text-blue-400 font-bold text-lg tracking-tight mb-3">
            ${listing.price.toLocaleString()}
          </p>

          {/* Match reasons */}
          {listing.score_reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {listing.score_reasons.slice(0, 2).map((reason) => (
                <span
                  key={reason}
                  className="text-[11px] text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-md"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-zinc-600">
            {listing.mileage.toLocaleString()} mi · {listing.location}
          </p>
        </div>
      </div>
    </Link>
  )
}
