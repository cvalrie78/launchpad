import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, DollarSign, Calendar, Globe, ArrowLeft, ExternalLink, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { ListingCard } from '@/components/listings/ListingCard'
import { ApplyButton } from '@/components/listings/ApplyButton'
import { formatPay, formatDeadline, locationLabel, industryColor, daysUntilDeadline } from '@/lib/utils'
import { mockListings } from '@/lib/mock-data'

interface Props {
  params: { id: string }
}

export default async function ListingPage({ params }: Props) {
  // --- Supabase swap ---
  // const supabase = createClient()
  // const { data: listing } = await supabase.from('listings').select('*, companies(*)').eq('id', params.id).single()
  const listing = mockListings.find(l => l.id === params.id)
  if (!listing) notFound()

  const company = listing.companies!
  const days = daysUntilDeadline(listing.deadline)
  const related = mockListings
    .filter(l => l.id !== listing.id && l.industry === listing.industry && l.is_active)
    .slice(0, 3)

  const hasExternalApply = !!(listing.apply_url)
  const applyHref = listing.apply_url ?? (listing.apply_email ? `mailto:${listing.apply_email}` : null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {listing.is_featured && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-blue-600">Featured Listing</span>
              </div>
            )}

            <div className="flex items-start gap-5">
              <CompanyLogo name={company.name} logoUrl={company.logo_url} size={64} />
              <div className="flex-1">
                <h1 className="font-heading font-bold text-navy text-2xl leading-tight mb-1">{listing.title}</h1>
                <Link href={`/companies/${company.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  {company.name}
                </Link>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge label={listing.industry} color={industryColor(listing.industry)} />
                  <Badge label={listing.type === 'co-op' ? 'Co-op' : 'Internship'} variant="type" />
                  <Badge label={listing.location_type.replace('-', ' ')} variant="location" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Compensation</p>
                    <p className="text-sm font-semibold text-navy">{formatPay(listing.pay_rate, listing.pay_period)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Location</p>
                    <p className="text-sm font-semibold text-navy">{locationLabel(listing.location_type, listing.city, listing.state)}</p>
                  </div>
                  {listing.deadline && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Deadline</p>
                      <p className={`text-sm font-semibold ${days !== null && days <= 7 ? 'text-orange-600' : 'text-navy'}`}>
                        {formatDeadline(listing.deadline)}
                        {days !== null && days >= 0 && days <= 14 && (
                          <span className="ml-1 text-xs font-normal text-gray-400">({days}d left)</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-heading font-semibold text-navy text-lg mb-4">About the Role</h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>
          </div>

          {/* Requirements */}
          {listing.requirements && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-heading font-semibold text-navy text-lg mb-4">Requirements</h2>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {listing.requirements}
              </div>
            </div>
          )}

          {/* Related listings */}
          {related.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-navy text-lg mb-4">
                More {listing.industry} opportunities
              </h2>
              <div className="space-y-3">
                {related.map(r => <ListingCard key={r.id} listing={r} />)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Apply card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h3 className="font-heading font-semibold text-navy mb-4">Apply Now</h3>

            {days !== null && days >= 0 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm ${
                days <= 7 ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{days === 0 ? 'Due today!' : `${days} day${days !== 1 ? 's' : ''} remaining`}</span>
              </div>
            )}

            {/* LaunchPad in-app apply (always shown) */}
            <ApplyButton
              listingId={listing.id}
              listingTitle={listing.title}
              companyName={company.name}
            />

            {/* External link as secondary option */}
            {hasExternalApply && (
              <a
                href={applyHref!}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors mt-2"
              >
                Apply on company site
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
              Your resume and info are sent directly to the employer.
            </p>
          </div>

          {/* Company card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-heading font-semibold text-navy mb-4">About {company.name}</h3>
            <div className="flex items-center gap-3 mb-3">
              <CompanyLogo name={company.name} logoUrl={company.logo_url} size={40} />
              <div>
                <p className="font-medium text-navy text-sm">{company.name}</p>
                <p className="text-xs text-gray-400">{company.industry}</p>
              </div>
            </div>
            {company.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{company.description}</p>
            )}
            <div className="flex flex-col gap-2">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <Globe className="w-3.5 h-3.5" /> {company.website.replace('https://', '')}
                </a>
              )}
              <Link href={`/companies/${company.id}`}
                className="text-sm text-blue-600 hover:text-blue-800">
                View all openings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return mockListings.map(l => ({ id: l.id }))
}
