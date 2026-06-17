'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState(params.get('search') ?? '')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (value.trim()) next.set('search', value.trim())
    else next.delete('search')
    next.delete('page')
    router.push(`/?${next.toString()}`)
  }, [value, params, router])

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search roles, companies, or industries..."
        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 text-base"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Search
      </button>
    </form>
  )
}
