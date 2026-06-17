'use client'

import Image from 'next/image'

interface CompanyLogoProps {
  name: string
  logoUrl: string | null
  size?: number
}

export function CompanyLogo({ name, logoUrl, size = 48 }: CompanyLogoProps) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&bold=true&size=128`

  return (
    <div
      className="rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Image
        src={logoUrl ?? fallback}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="object-contain p-1"
        onError={(e) => {
          ;(e.target as HTMLImageElement).src = fallback
        }}
        unoptimized
      />
    </div>
  )
}
