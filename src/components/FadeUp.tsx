'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface FadeUpProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

// Scroll-entry reveal: translateY(12px) + opacity 0 resolving over 600ms.
// Uses IntersectionObserver and unobserves after the first reveal.
export default function FadeUp({ children, className, delay = 0 }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '-60px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('fade-up', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
