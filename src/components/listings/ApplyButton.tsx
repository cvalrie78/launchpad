'use client'

import { useState } from 'react'
import { ApplyModal } from './ApplyModal'

interface ApplyButtonProps {
  listingId: string
  listingTitle: string
  companyName: string
}

export function ApplyButton({ listingId, listingTitle, companyName }: ApplyButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Apply Now
      </button>

      {open && (
        <ApplyModal
          listingId={listingId}
          listingTitle={listingTitle}
          companyName={companyName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
