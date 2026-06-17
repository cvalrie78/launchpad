import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPay(rate: number | null, period: string | null): string {
  if (!rate || !period) return 'Pay not listed'
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  if (period === 'hourly') return `${fmt.format(rate)}/hr`
  if (period === 'monthly') return `${fmt.format(rate)}/mo`
  return `${fmt.format(rate)} stipend`
}

export function formatDeadline(date: string | null): string {
  if (!date) return 'Rolling'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function daysUntilDeadline(date: string | null): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function locationLabel(type: string, city?: string | null, state?: string | null): string {
  if (type === 'remote') return 'Remote'
  const place = [city, state].filter(Boolean).join(', ')
  return place ? `${type === 'hybrid' ? 'Hybrid · ' : ''}${place}` : type
}

// Industry color map (matches seed data)
export const INDUSTRY_COLORS: Record<string, string> = {
  Technology:   '#3b82f6',
  Finance:      '#10b981',
  Engineering:  '#f59e0b',
  Healthcare:   '#ef4444',
  Marketing:    '#8b5cf6',
  Government:   '#6b7280',
  'Non-profit': '#ec4899',
  Energy:       '#f97316',
  Consulting:   '#0ea5e9',
  Legal:        '#84cc16',
  Media:        '#a855f7',
  'Real Estate':'#14b8a6',
}

export function industryColor(name: string): string {
  return INDUSTRY_COLORS[name] ?? '#6b7280'
}
