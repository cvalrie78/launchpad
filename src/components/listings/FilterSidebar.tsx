'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { INDUSTRY_COLORS } from '@/lib/utils'

const INDUSTRIES = Object.keys(INDUSTRY_COLORS)
const TYPES = [{ value: 'internship', label: 'Internship' }, { value: 'co-op', label: 'Co-op' }]
const LOCATIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
]

export function FilterSidebar() {
  const router = useRouter()
  const params = useSearchParams()

  const update = useCallback((key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    router.push(`/?${next.toString()}`)
  }, [params, router])

  const toggle = useCallback((key: string, value: string) => {
    update(key, params.get(key) === value ? null : value)
  }, [params, update])

  const clearAll = useCallback(() => router.push('/'), [router])

  const hasFilters = ['industry', 'type', 'location', 'pay_min'].some(k => params.has(k))

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-navy text-sm uppercase tracking-wider">Filters</h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Type */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Role Type</h3>
        <div className="space-y-2">
          {TYPES.map(t => (
            <label key={t.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={params.get('type') === t.value}
                onChange={() => toggle('type', t.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-navy">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Location Type</h3>
        <div className="space-y-2">
          {LOCATIONS.map(l => (
            <label key={l.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={params.get('location') === l.value}
                onChange={() => toggle('location', l.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-navy capitalize">{l.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Industry */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Industry</h3>
        <div className="space-y-1.5">
          {INDUSTRIES.map(ind => {
            const color = INDUSTRY_COLORS[ind]
            const active = params.get('industry') === ind
            return (
              <button
                key={ind}
                onClick={() => toggle('industry', ind)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-left transition-colors ${
                  active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                {ind}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pay range */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Min Pay (hourly)</h3>
        <select
          value={params.get('pay_min') ?? ''}
          onChange={e => update('pay_min', e.target.value || null)}
          className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any</option>
          <option value="15">$15+/hr</option>
          <option value="20">$20+/hr</option>
          <option value="25">$25+/hr</option>
          <option value="30">$30+/hr</option>
          <option value="40">$40+/hr</option>
        </select>
      </div>
    </aside>
  )
}
