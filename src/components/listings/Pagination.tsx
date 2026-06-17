'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const params = useSearchParams()

  if (totalPages <= 1) return null

  const go = (page: number) => {
    const next = new URLSearchParams(params.toString())
    next.set('page', String(page))
    router.push(`/?${next.toString()}`)
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  )

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) => {
        const prev = pages[i - 1]
        return (
          <>
            {prev && page - prev > 1 && (
              <span key={`gap-${page}`} className="text-gray-400 text-sm px-1">…</span>
            )}
            <button
              key={page}
              onClick={() => go(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          </>
        )
      })}

      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
