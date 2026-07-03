'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretDown, ChatCircle, List, SignOut, SquaresFour, X } from '@phosphor-icons/react'
import { useUser } from '@/components/AuthProvider'
import { cn, initials } from '@/lib/utils'

export default function Navbar() {
  const { user, profile, loading, signOut } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = profile?.full_name || user?.email || ''

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tighter text-zinc-50"
        >
          Autolens
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/listings"
            className={cn(
              'text-sm transition-colors hover:text-zinc-50',
              pathname === '/listings' ? 'text-zinc-50' : 'text-zinc-400'
            )}
          >
            Browse
          </Link>
          <Link
            href="/listings/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
          >
            Sell a car
          </Link>

          {loading ? (
            <div className="h-9 w-9 rounded-full skeleton" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-zinc-900"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-50">
                  {initials(displayName) || 'U'}
                </span>
                <CaretDown size={14} className="text-zinc-400" weight="bold" />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-zinc-800 bg-[#141414] p-1 shadow-card"
                    role="menu"
                  >
                    <div className="border-b border-zinc-800 px-3 py-2">
                      <p className="truncate text-sm font-medium text-zinc-50">{displayName}</p>
                      <p className="text-xs text-zinc-400">
                        {profile?.account_type === 'dealer' ? 'Dealer account' : 'Private seller'}
                      </p>
                    </div>
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
                      role="menuitem"
                    >
                      <SquaresFour size={16} />
                      My listings
                    </Link>
                    <Link
                      href="/messages"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
                      role="menuitem"
                    >
                      <ChatCircle size={16} />
                      Inbox
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
                      role="menuitem"
                    >
                      <SignOut size={16} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-50"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-50 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <List size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-zinc-800 bg-zinc-950 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              <Link
                href="/listings"
                className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
              >
                Browse
              </Link>
              <Link
                href="/listings/new"
                className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
              >
                Sell a car
              </Link>
              {user ? (
                <>
                  <Link
                    href={`/profile/${user.id}`}
                    className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
                  >
                    My listings
                  </Link>
                  <Link
                    href="/messages"
                    className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
                  >
                    Inbox
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded-md px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
