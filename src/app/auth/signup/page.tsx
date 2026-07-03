'use client'

import Link from 'next/link'
import { useState } from 'react'
import { EnvelopeSimple } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import type { AccountType } from '@/lib/types'
import { cn } from '@/lib/utils'

const fieldClass =
  'h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-accent focus:outline-none'

export default function SignupPage() {
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('private')
  const [dealerName, setDealerName] = useState('')
  const [working, setWorking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (working) return

    if (accountType === 'dealer' && !dealerName.trim()) {
      setErrorMessage('Enter your dealership name.')
      return
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      return
    }

    setWorking(true)
    setErrorMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          account_type: accountType,
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setWorking(false)
      return
    }

    // The database trigger creates the profile with name and account type.
    // Dealer name is not in the trigger, so write it here if a session exists
    // (with email confirmation enabled there is no session yet; the dealer
    // name is applied on first sign-in below via the profiles update policy).
    if (accountType === 'dealer' && data.user && data.session) {
      await supabase.from('profiles').update({ dealer_name: dealerName.trim() }).eq('id', data.user.id)
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-[#141414]">
          <EnvelopeSimple size={26} className="text-accent" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tighter text-zinc-50">
          Check your email
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
          A confirmation link is on its way to {email.trim()}. Open it to activate your account,
          then sign in. If email confirmation is disabled on the project, you can sign in right
          away.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
        >
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-zinc-50">
        Create an account
      </h1>
      <p className="mt-2 text-sm text-zinc-400">Post listings and message sellers in minutes.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Account type toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-md border border-zinc-800 p-1">
          {(['private', 'dealer'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={cn(
                'rounded px-3 py-2 text-sm transition-colors duration-150',
                accountType === type
                  ? 'bg-accent text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-50'
              )}
            >
              {type === 'private' ? 'Private seller' : 'Dealer'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="full-name" className="text-sm font-medium text-zinc-50">
            Full name
          </label>
          <input
            id="full-name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="e.g. Marcus Okafor"
            className={fieldClass}
          />
        </div>

        {accountType === 'dealer' && (
          <div className="flex flex-col gap-2">
            <label htmlFor="dealer-name" className="text-sm font-medium text-zinc-50">
              Dealership name
            </label>
            <input
              id="dealer-name"
              type="text"
              value={dealerName}
              onChange={(event) => setDealerName(event.target.value)}
              placeholder="e.g. Summit Auto Group"
              className={fieldClass}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-50">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-zinc-50">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className={fieldClass}
          />
        </div>

        {errorMessage && (
          <p className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={working}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {working ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
