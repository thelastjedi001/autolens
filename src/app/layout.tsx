import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import AuthProvider from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Autolens',
    template: '%s | Autolens',
  },
  description:
    'A car marketplace for private sellers and dealers. List a car, browse thousands of listings, and message sellers directly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh] bg-[#0a0a0a] text-zinc-50">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="mt-20 border-t border-zinc-800">
            <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
              <p className="font-display text-sm font-bold tracking-tighter text-zinc-50">
                Autolens
              </p>
              <p className="text-xs text-zinc-500">
                A portfolio project. Listings are demo data, not real cars for sale.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
