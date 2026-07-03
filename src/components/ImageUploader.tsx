'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CloudArrowUp, Trash, UploadSimple } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/AuthProvider'
import { cn } from '@/lib/utils'

export interface UploadedImage {
  storage_path: string
  url: string
}

interface PendingFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  uploaded?: UploadedImage
  error?: string
}

interface ImageUploaderProps {
  maxImages?: number
  onChange: (images: UploadedImage[]) => void
}

export default function ImageUploader({ maxImages = 10, onChange }: ImageUploaderProps) {
  const supabase = createClient()
  const { user } = useUser()
  const [files, setFiles] = useState<PendingFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef<PendingFile[]>([])
  filesRef.current = files

  // Report uploaded images to the parent whenever order or status changes
  useEffect(() => {
    onChange(
      files
        .filter((entry) => entry.status === 'done' && entry.uploaded)
        .map((entry) => entry.uploaded!)
    )
  }, [files, onChange])

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      filesRef.current.forEach((entry) => URL.revokeObjectURL(entry.preview))
    }
  }, [])

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const selected = Array.from(incoming).filter((file) => file.type.startsWith('image/'))
      setFiles((current) => {
        const room = maxImages - current.length
        const next = selected.slice(0, Math.max(room, 0)).map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          status: 'pending' as const,
          progress: 0,
        }))
        return [...current, ...next]
      })
    },
    [maxImages]
  )

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragOver(false)
    if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files)
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const target = current.find((entry) => entry.id === id)
      if (target) {
        URL.revokeObjectURL(target.preview)
        // Best-effort cleanup of already-uploaded files
        if (target.uploaded) {
          supabase.storage.from('listing-images').remove([target.uploaded.storage_path])
        }
      }
      return current.filter((entry) => entry.id !== id)
    })
  }

  // Reorder via HTML5 drag-and-drop on the preview grid
  function handleReorder(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return
    setFiles((current) => {
      const next = [...current]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDragIndex(targetIndex)
  }

  async function uploadAll() {
    if (!user) return
    const pending = filesRef.current.filter((entry) => entry.status === 'pending' || entry.status === 'error')

    for (const entry of pending) {
      setFiles((current) =>
        current.map((item) =>
          item.id === entry.id ? { ...item, status: 'uploading', progress: 30, error: undefined } : item
        )
      )

      const extension = entry.file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`

      const { error } = await supabase.storage
        .from('listing-images')
        .upload(storagePath, entry.file, { cacheControl: '3600', upsert: false })

      if (error) {
        setFiles((current) =>
          current.map((item) =>
            item.id === entry.id
              ? { ...item, status: 'error', progress: 0, error: error.message }
              : item
          )
        )
        continue
      }

      const { data } = supabase.storage.from('listing-images').getPublicUrl(storagePath)
      setFiles((current) =>
        current.map((item) =>
          item.id === entry.id
            ? {
                ...item,
                status: 'done',
                progress: 100,
                uploaded: { storage_path: storagePath, url: data.publicUrl },
              }
            : item
        )
      )
    }
  }

  const pendingCount = files.filter((entry) => entry.status === 'pending' || entry.status === 'error').length
  const uploadingCount = files.filter((entry) => entry.status === 'uploading').length

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors duration-150',
          dragOver ? 'border-accent bg-accent/5' : 'border-zinc-800 hover:border-zinc-700'
        )}
      >
        <CloudArrowUp size={32} className="text-zinc-400" />
        <div>
          <p className="text-sm font-medium text-zinc-50">
            Drag photos here, or click to browse
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Up to {maxImages} images. JPG, PNG, or WebP.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {files.length > 0 && (
        <>
          <p className="mt-4 text-xs text-zinc-400">
            {files.length} of {maxImages} photos. Drag to reorder; the first photo is the cover.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((entry, fileIndex) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => setDragIndex(fileIndex)}
                onDragOver={(event) => {
                  event.preventDefault()
                  handleReorder(fileIndex)
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  'group relative aspect-video cursor-grab overflow-hidden rounded-md border bg-zinc-900 active:cursor-grabbing',
                  dragIndex === fileIndex ? 'border-accent' : 'border-zinc-800'
                )}
              >
                <Image
                  src={entry.preview}
                  alt={entry.file.name}
                  fill
                  unoptimized
                  sizes="200px"
                  className="object-cover"
                />
                {fileIndex === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-zinc-50">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(entry.id)}
                  aria-label={`Remove ${entry.file.name}`}
                  className="absolute right-2 top-2 rounded-md bg-zinc-950/80 p-1.5 text-zinc-400 opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
                >
                  <Trash size={14} />
                </button>
                {/* Per-file progress bar */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-950/60">
                  <div
                    className={cn(
                      'h-full transition-[width] duration-300',
                      entry.status === 'error' ? 'bg-red-500' : 'bg-accent'
                    )}
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
                {entry.status === 'done' && (
                  <span className="absolute bottom-2 right-2 rounded bg-zinc-950/80 px-1.5 py-0.5 text-[10px] text-emerald-400 backdrop-blur-sm">
                    Uploaded
                  </span>
                )}
                {entry.status === 'error' && (
                  <span className="absolute bottom-2 right-2 max-w-[80%] truncate rounded bg-zinc-950/80 px-1.5 py-0.5 text-[10px] text-red-400 backdrop-blur-sm">
                    {entry.error ?? 'Upload failed'}
                  </span>
                )}
              </div>
            ))}
          </div>

          {(pendingCount > 0 || uploadingCount > 0) && (
            <button
              type="button"
              onClick={uploadAll}
              disabled={uploadingCount > 0}
              className="mt-4 flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UploadSimple size={16} weight="bold" />
              {uploadingCount > 0
                ? 'Uploading...'
                : `Upload ${pendingCount} photo${pendingCount === 1 ? '' : 's'}`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
