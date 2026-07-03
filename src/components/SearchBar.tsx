'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/listings?q=${encodeURIComponent(trimmed)}` : '/listings')
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-2">
      <label htmlFor="search" className="sr-only">
        Search make, model, or location
      </label>
      <input
        id="search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search make, model, or location"
        className="h-12 w-full rounded-md border border-zinc-800 bg-[#141414] px-4 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="flex h-12 shrink-0 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
      >
        <MagnifyingGlass size={16} weight="bold" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  )
}
