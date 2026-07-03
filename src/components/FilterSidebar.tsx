'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FunnelSimple, X } from '@phosphor-icons/react'
import { BODY_TYPES, FUEL_TYPES, label } from '@/lib/utils'

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-800 pb-5">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">{title}</h3>
      {children}
    </div>
  )
}

const inputClass =
  'h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'

function Filters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Local state for text/number inputs so typing feels instant,
  // synced to the URL after a short debounce.
  const [make, setMake] = useState(searchParams.get('make') ?? '')
  const [model, setModel] = useState(searchParams.get('model') ?? '')
  const [minYear, setMinYear] = useState(searchParams.get('min_year') ?? '')
  const [maxYear, setMaxYear] = useState(searchParams.get('max_year') ?? '')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') ?? '')

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  // Debounced sync for typed values
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const current = new URLSearchParams(searchParams.toString())
      const entries: Array<[string, string]> = [
        ['make', make],
        ['model', model],
        ['min_year', minYear],
        ['max_year', maxYear],
        ['min_price', minPrice],
        ['max_price', maxPrice],
      ]
      let changed = false
      entries.forEach(([key, value]) => {
        const existing = current.get(key) ?? ''
        if (existing !== value.trim()) {
          changed = true
          if (value.trim()) current.set(key, value.trim())
          else current.delete(key)
        }
      })
      if (changed) router.push(`${pathname}?${current.toString()}`)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [make, model, minYear, maxYear, minPrice, maxPrice, pathname, router, searchParams])

  const selectedFuel = searchParams.getAll('fuel_type')
  const selectedBody = searchParams.getAll('body_type')
  const transmission = searchParams.get('transmission') ?? ''

  function toggleMulti(key: string, value: string) {
    pushParams((params) => {
      const values = params.getAll(key)
      params.delete(key)
      const next = values.includes(value)
        ? values.filter((entry) => entry !== value)
        : [...values, value]
      next.forEach((entry) => params.append(key, entry))
    })
  }

  function setTransmission(value: string) {
    pushParams((params) => {
      if (params.get('transmission') === value) params.delete('transmission')
      else params.set('transmission', value)
    })
  }

  function clearAll() {
    setMake('')
    setModel('')
    setMinYear('')
    setMaxYear('')
    setMinPrice('')
    setMaxPrice('')
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-5">
      <FilterSection title="Make">
        <input
          type="text"
          value={make}
          onChange={(event) => setMake(event.target.value)}
          placeholder="e.g. Toyota"
          className={inputClass}
        />
      </FilterSection>

      <FilterSection title="Model">
        <input
          type="text"
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder={make ? 'e.g. RAV4' : 'Enter a make first'}
          disabled={!make}
          className={inputClass}
        />
      </FilterSection>

      <FilterSection title="Year">
        <div className="flex gap-2">
          <input
            type="number"
            value={minYear}
            onChange={(event) => setMinYear(event.target.value)}
            placeholder="Min"
            min={1900}
            max={2100}
            className={inputClass}
          />
          <input
            type="number"
            value={maxYear}
            onChange={(event) => setMaxYear(event.target.value)}
            placeholder="Max"
            min={1900}
            max={2100}
            className={inputClass}
          />
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Min $"
            min={0}
            className={inputClass}
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max $"
            min={0}
            className={inputClass}
          />
        </div>
      </FilterSection>

      <FilterSection title="Fuel type">
        <div className="space-y-2">
          {FUEL_TYPES.map((fuel) => (
            <label key={fuel} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={selectedFuel.includes(fuel)}
                onChange={() => toggleMulti('fuel_type', fuel)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-[#2563EB]"
              />
              {label(fuel)}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Transmission">
        <div className="space-y-2">
          {(['manual', 'automatic'] as const).map((value) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
              <input
                type="radio"
                name="transmission"
                checked={transmission === value}
                onChange={() => setTransmission(value)}
                className="h-4 w-4 border-zinc-700 bg-zinc-950 accent-[#2563EB]"
              />
              {label(value)}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Body type">
        <div className="space-y-2">
          {BODY_TYPES.map((body) => (
            <label key={body} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={selectedBody.includes(body)}
                onChange={() => toggleMulti('body_type', body)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-[#2563EB]"
              />
              {label(body)}
            </label>
          ))}
        </div>
      </FilterSection>

      <button
        onClick={clearAll}
        className="w-full rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-50 active:scale-[0.98]"
      >
        Clear all
      </button>
    </div>
  )
}

export default function FilterSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <Filters />
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="flex items-center gap-2 rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-50 active:scale-[0.98] lg:hidden"
      >
        <FunnelSimple size={16} />
        Filters
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-5 lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-zinc-50">Filters</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-50"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>
              <Filters />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
