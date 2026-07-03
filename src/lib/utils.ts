import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatMileage(miles: number): string {
  return new Intl.NumberFormat('en-US').format(miles) + ' mi'
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export const BODY_TYPES = [
  'sedan',
  'suv',
  'hatchback',
  'coupe',
  'truck',
  'van',
  'wagon',
  'convertible',
  'other',
] as const

export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'other'] as const
export const TRANSMISSIONS = ['manual', 'automatic'] as const
export const CONDITIONS = ['new', 'used', 'certified_pre_owned'] as const

export const COMMON_MAKES = [
  'Audi', 'BMW', 'Chevrolet', 'Dodge', 'Ford', 'Honda', 'Hyundai', 'Jeep',
  'Kia', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Porsche', 'Ram',
  'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
] as const

export function label(value: string): string {
  if (value === 'suv') return 'SUV'
  if (value === 'certified_pre_owned') return 'Certified pre-owned'
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}
