import Link from 'next/link'
import { MapPin, DollarSign, Calendar, Star, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { formatPay, formatDeadline, locationLabel, industryColor, daysUntilDeadline, cn } from '@/lib/utils'
import type { Listing } from '@/types'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const company  = listing.companies
  const days     = daysUntilDeadline(listing.deadline)
  const isUrgent = days !== null && days <= 7 && days >= 0
  const isPast   = days !== null && days < 0
  const tier     = listing.tier ?? 'standard'

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <article
        className={cn(
          'bg-white rounded-xl border transition-all duration-200 p-5',
          'hover:shadow-md hover:-translate-y-0.5',
          tier === 'premium'  && 'border-purple-200 border-l-4 border-l-purple-500 shadow-sm bg-purple-50/20',
          tier === 'featured' && 'border-blue-200 border-l-4 border-l-blue-500 shadow-sm',
          tier === 'standard' && 'border-gray-200',
        )}
      >
        {/* Tier badge */}
        {tier === 'premium' && (
          <div className="flex items-center gap-1.5 mb-3">
            <Crown className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Premium</span>
          </div>
        )}
        {tier === 'featured' && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Featured</span>
          </div>
        )}

        <div className="flex items-start gap-4">
          <CompanyLogo name={company?.name ?? 'Company'} logoUrl={company?.logo_url ?? null} size={48} />

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-heading font-semibold text-base leading-snug line-clamp-1 transition-colors',
              tier === 'premium'  ? 'text-purple-900 group-hover:text-purple-700' : 'text-navy group-hover:text-blue-700',
            )}>
              {listing.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{company?.name}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge label={listing.industry} color={industryColor(listing.industry)} />
              <Badge label={listing.type === 'co-op' ? 'Co-op' : 'Internship'} variant="type" />
              <Badge label={listing.location_type.replace('-', ' ')} variant="location" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                {formatPay(listing.pay_rate, listing.pay_period)}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {locationLabel(listing.location_type, listing.city, listing.state)}
              </span>
              {listing.deadline && (
                <span className={cn(
                  'flex items-center gap-1.5 text-sm',
                  isUrgent ? 'text-orange-600 font-medium' : isPast ? 'text-red-500' : 'text-gray-600',
                )}>
                  <Calendar className="w-3.5 h-3.5" />
                  {isPast ? 'Deadline passed' : isUrgent ? `${days}d left` : `Due ${formatDeadline(listing.deadline)}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
