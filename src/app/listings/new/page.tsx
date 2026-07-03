'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/AuthProvider'
import ImageUploader, { type UploadedImage } from '@/components/ImageUploader'
import type { BodyType, Condition, FuelType, Transmission } from '@/lib/types'
import {
  BODY_TYPES,
  COMMON_MAKES,
  CONDITIONS,
  FUEL_TYPES,
  TRANSMISSIONS,
  cn,
  formatMileage,
  formatPrice,
  label,
} from '@/lib/utils'

const STEPS = ['Car details', 'Photos', 'Review and publish'] as const

interface FormState {
  make: string
  model: string
  year: string
  price: string
  mileage: string
  fuel_type: FuelType | ''
  transmission: Transmission | ''
  body_type: BodyType | ''
  colour: string
  condition: Condition
  description: string
  location: string
}

const EMPTY_FORM: FormState = {
  make: '',
  model: '',
  year: '',
  price: '',
  mileage: '',
  fuel_type: '',
  transmission: '',
  body_type: '',
  colour: '',
  condition: 'used',
  description: '',
  location: '',
}

const fieldClass =
  'h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-accent focus:outline-none'

function Field({
  name,
  error,
  children,
}: {
  name: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-50">{name}</label>
      {children}
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default function NewListingPage() {
  const supabase = createClient()
  const { user, loading } = useUser()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  // Backup client-side guard; the middleware already redirects unauthenticated visitors
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?next=/listings/new')
    }
  }, [loading, user, router])

  const handleImagesChange = useCallback((uploaded: UploadedImage[]) => {
    setImages(uploaded)
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function validateDetails(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    const yearNumber = Number(form.year)
    const priceNumber = Number(form.price)
    const mileageNumber = Number(form.mileage)

    if (!form.make.trim()) next.make = 'Enter the make.'
    if (!form.model.trim()) next.model = 'Enter the model.'
    if (!form.year.trim() || Number.isNaN(yearNumber) || yearNumber < 1900 || yearNumber > 2100)
      next.year = 'Enter a year between 1900 and 2100.'
    if (!form.price.trim() || Number.isNaN(priceNumber) || priceNumber < 0)
      next.price = 'Enter a price of 0 or more.'
    if (form.mileage.trim() && (Number.isNaN(mileageNumber) || mileageNumber < 0))
      next.mileage = 'Mileage must be 0 or more.'
    if (!form.location.trim()) next.location = 'Enter a city and state.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const title = [form.year, form.make, form.model].filter(Boolean).join(' ')

  async function publish() {
    if (!user || publishing) return
    setPublishing(true)
    setPublishError(null)

    const { data: created, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        title,
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        price: Number(form.price),
        mileage: form.mileage.trim() ? Number(form.mileage) : null,
        fuel_type: form.fuel_type || null,
        transmission: form.transmission || null,
        body_type: form.body_type || null,
        colour: form.colour.trim() || null,
        condition: form.condition,
        description: form.description.trim() || null,
        location: form.location.trim(),
        status: 'active',
      })
      .select('id')
      .single()

    if (error || !created) {
      setPublishError(error?.message ?? 'The listing could not be saved. Try again.')
      setPublishing(false)
      return
    }

    if (images.length > 0) {
      const { error: imagesError } = await supabase.from('listing_images').insert(
        images.map((image, position) => ({
          listing_id: created.id,
          storage_path: image.storage_path,
          url: image.url,
          position,
        }))
      )
      if (imagesError) {
        // The listing exists; surface the photo failure instead of silently dropping it
        setPublishError(
          'The listing was created but the photos failed to attach: ' + imagesError.message
        )
        setPublishing(false)
        return
      }
    }

    router.push(`/listings/${created.id}`)
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton mt-6 h-64 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-zinc-50 md:text-4xl">
        Sell your car
      </h1>

      {/* Step indicator */}
      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((name, index) => (
          <li key={name} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors duration-150',
                index < step
                  ? 'bg-accent text-zinc-50'
                  : index === step
                    ? 'border border-accent text-zinc-50'
                    : 'border border-zinc-800 text-zinc-500'
              )}
            >
              {index < step ? <Check size={13} weight="bold" /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden text-sm sm:inline',
                index === step ? 'text-zinc-50' : 'text-zinc-500'
              )}
            >
              {name}
            </span>
            {index < STEPS.length - 1 && <span className="h-px w-6 bg-zinc-800" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-zinc-800 bg-[#141414] p-6 md:p-8">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="Make" error={errors.make}>
              <input
                type="text"
                list="common-makes"
                value={form.make}
                onChange={(event) => set('make', event.target.value)}
                placeholder="e.g. Toyota"
                className={fieldClass}
              />
              <datalist id="common-makes">
                {COMMON_MAKES.map((make) => (
                  <option key={make} value={make} />
                ))}
              </datalist>
            </Field>

            <Field name="Model" error={errors.model}>
              <input
                type="text"
                value={form.model}
                onChange={(event) => set('model', event.target.value)}
                placeholder="e.g. RAV4 Hybrid XLE"
                className={fieldClass}
              />
            </Field>

            <Field name="Year" error={errors.year}>
              <input
                type="number"
                value={form.year}
                onChange={(event) => set('year', event.target.value)}
                placeholder="e.g. 2021"
                min={1900}
                max={2100}
                className={fieldClass}
              />
            </Field>

            <Field name="Price (USD)" error={errors.price}>
              <input
                type="number"
                value={form.price}
                onChange={(event) => set('price', event.target.value)}
                placeholder="e.g. 28500"
                min={0}
                className={fieldClass}
              />
            </Field>

            <Field name="Mileage (optional)" error={errors.mileage}>
              <input
                type="number"
                value={form.mileage}
                onChange={(event) => set('mileage', event.target.value)}
                placeholder="e.g. 42000"
                min={0}
                className={fieldClass}
              />
            </Field>

            <Field name="Colour (optional)">
              <input
                type="text"
                value={form.colour}
                onChange={(event) => set('colour', event.target.value)}
                placeholder="e.g. Lunar Rock"
                className={fieldClass}
              />
            </Field>

            <Field name="Fuel type (optional)">
              <select
                value={form.fuel_type}
                onChange={(event) => set('fuel_type', event.target.value as FuelType | '')}
                className={fieldClass}
              >
                <option value="">Select fuel type</option>
                {FUEL_TYPES.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {label(fuel)}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="Transmission (optional)">
              <select
                value={form.transmission}
                onChange={(event) => set('transmission', event.target.value as Transmission | '')}
                className={fieldClass}
              >
                <option value="">Select transmission</option>
                {TRANSMISSIONS.map((value) => (
                  <option key={value} value={value}>
                    {label(value)}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="Body type (optional)">
              <select
                value={form.body_type}
                onChange={(event) => set('body_type', event.target.value as BodyType | '')}
                className={fieldClass}
              >
                <option value="">Select body type</option>
                {BODY_TYPES.map((body) => (
                  <option key={body} value={body}>
                    {label(body)}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="Condition">
              <select
                value={form.condition}
                onChange={(event) => set('condition', event.target.value as Condition)}
                className={fieldClass}
              >
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {label(condition)}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="Location" error={errors.location}>
              <input
                type="text"
                value={form.location}
                onChange={(event) => set('location', event.target.value)}
                placeholder="e.g. Pocatello, ID"
                className={fieldClass}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field name="Description (optional)">
                <textarea
                  value={form.description}
                  onChange={(event) => set('description', event.target.value)}
                  placeholder="Service history, options, known issues, reason for selling"
                  rows={5}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm leading-relaxed text-zinc-50 placeholder:text-zinc-600 focus:border-accent focus:outline-none"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <ImageUploader maxImages={10} onChange={handleImagesChange} />
            {images.length === 0 && (
              <p className="mt-4 text-xs text-zinc-400">
                Photos are optional, but listings with photos get far more messages.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl font-bold tracking-tighter text-zinc-50">
              {title || 'Untitled listing'}
            </h2>
            <p className="mt-1 text-2xl font-bold text-accent">
              {form.price ? formatPrice(Number(form.price)) : 'No price set'}
            </p>

            <dl className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800 sm:grid-cols-2">
              {[
                { name: 'Mileage', value: form.mileage ? formatMileage(Number(form.mileage)) : 'Not specified' },
                { name: 'Fuel type', value: form.fuel_type ? label(form.fuel_type) : 'Not specified' },
                { name: 'Transmission', value: form.transmission ? label(form.transmission) : 'Not specified' },
                { name: 'Body type', value: form.body_type ? label(form.body_type) : 'Not specified' },
                { name: 'Colour', value: form.colour || 'Not specified' },
                { name: 'Condition', value: label(form.condition) },
                { name: 'Location', value: form.location || 'Not specified' },
                { name: 'Photos', value: `${images.length} uploaded` },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between bg-[#141414] px-4 py-3">
                  <dt className="text-sm text-zinc-400">{row.name}</dt>
                  <dd className="text-sm text-zinc-50">{row.value}</dd>
                </div>
              ))}
            </dl>

            {form.description && (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                {form.description}
              </p>
            )}

            {publishError && (
              <p className="mt-5 rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400" role="alert">
                {publishError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Step controls */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0 || publishing}
          className="flex items-center gap-2 rounded-md border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 transition-colors duration-150 hover:text-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 0 && !validateDetails()) return
              setStep((current) => current + 1)
            }}
            className="flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={publish}
            disabled={publishing}
            className="flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing ? 'Publishing...' : 'Publish listing'}
          </button>
        )}
      </div>
    </div>
  )
}
