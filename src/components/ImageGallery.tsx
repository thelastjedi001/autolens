'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { ListingImage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: ListingImage[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position)
  const [index, setIndex] = useState(0)

  const goPrev = useCallback(() => {
    setIndex((current) => (current === 0 ? sorted.length - 1 : current - 1))
  }, [sorted.length])

  const goNext = useCallback(() => {
    setIndex((current) => (current === sorted.length - 1 ? 0 : current + 1))
  }, [sorted.length])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goPrev, goNext])

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-zinc-800 bg-[#141414] text-sm text-zinc-600">
        No photos for this listing
      </div>
    )
  }

  const current = sorted[index]

  return (
    <div>
      <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        <Image
          src={current.url}
          alt={`${title}, photo ${index + 1} of ${sorted.length}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
        {sorted.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-800 bg-zinc-950/80 p-2 text-zinc-50 opacity-0 backdrop-blur-sm transition-opacity duration-150 focus:opacity-100 group-hover:opacity-100 active:scale-[0.98]"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-800 bg-zinc-950/80 p-2 text-zinc-50 opacity-0 backdrop-blur-sm transition-opacity duration-150 focus:opacity-100 group-hover:opacity-100 active:scale-[0.98]"
            >
              <CaretRight size={18} weight="bold" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 font-mono text-xs text-zinc-400 backdrop-blur-sm">
              {index + 1} / {sorted.length}
            </span>
          </>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {sorted.map((image, thumbIndex) => (
            <button
              key={image.id}
              onClick={() => setIndex(thumbIndex)}
              aria-label={`Show photo ${thumbIndex + 1}`}
              className={cn(
                'relative aspect-video w-24 shrink-0 overflow-hidden rounded-md border transition-colors duration-150',
                thumbIndex === index
                  ? 'border-accent'
                  : 'border-zinc-800 opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
