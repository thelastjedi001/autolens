'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const fieldClass =
  'h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-accent focus:outline-none'

function LoginForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [working, setWorking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (working) return
    setWorking(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setErrorMessage(
        error.message === 'Invalid login credentials'
          ? 'That email and password combination does not match an account.'
          : error.message
      )
      setWorking(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
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
        {working ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-zinc-400">
        New to Autolens?{' '}
        <Link href="/auth/signup" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-zinc-50">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Sign in to post listings and message sellers.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="skeleton h-64 w-full rounded-lg" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
