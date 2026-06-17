import { Suspense } from 'react'
import Image from 'next/image'
import { SearchBar } from '@/components/listings/SearchBar'
import { FilterSidebar } from '@/components/listings/FilterSidebar'
import { ListingCard } from '@/components/listings/ListingCard'
import { Pagination } from '@/components/listings/Pagination'
import { Briefcase, Building2, Users, TrendingUp, Crown } from 'lucide-react'
import { mockListings } from '@/lib/mock-data'
import type { Listing, ListingFilters } from '@/types'

const PAGE_SIZE = 20

function filterListings(listings: Listing[], filters: ListingFilters): Listing[] {
  return listings.filter(l => {
    if (filters.industry     && l.industry      !== filters.industry)                              return false
    if (filters.type         && l.type          !== filters.type)                                  return false
    if (filters.location_type && l.location_type !== filters.location_type)                        return false
    if (filters.pay_min && l.pay_rate && l.pay_period === 'hourly' && l.pay_rate < filters.pay_min) return false
    if (filters.search) {
      const q        = filters.search.toLowerCase()
      const haystack = `${l.title} ${l.industry} ${l.companies?.name ?? ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

// Sort: premium first, then featured, then standard — within each group newest first
function sortListings(listings: Listing[]): Listing[] {
  const order = { premium: 0, featured: 1, standard: 2 }
  return [...listings].sort((a, b) => {
    const tierDiff = (order[a.tier ?? 'standard']) - (order[b.tier ?? 'standard'])
    if (tierDiff !== 0) return tierDiff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

interface HomePageProps {
  searchParams: {
    industry?: string
    type?: string
    location?: string
    pay_min?: string
    search?: string
    page?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const filters: ListingFilters = {
    industry:      searchParams.industry,
    type:          searchParams.type as ListingFilters['type'],
    location_type: searchParams.location as ListingFilters['location_type'],
    pay_min:       searchParams.pay_min ? Number(searchParams.pay_min) : undefined,
    search:        searchParams.search,
  }

  const page = Number(searchParams.page ?? 1)

  // --- Supabase swap ---
  // const supabase = createClient()
  // let query = supabase.from('listings').select('*, companies(*)').eq('is_active', true)
  // if (filters.industry)      query = query.eq('industry', filters.industry)
  // if (filters.type)          query = query.eq('type', filters.type)
  // if (filters.location_type) query = query.eq('location_type', filters.location_type)
  // if (filters.pay_min)       query = query.gte('pay_rate', filters.pay_min).eq('pay_period', 'hourly')
  // if (filters.search)        query = query.ilike('title', `%${filters.search}%`)
  // const { data } = await query
  // const allListings = sortListings(data ?? [])

  const allListings  = sortListings(filterListings(mockListings, filters))
  const totalPages   = Math.ceil(allListings.length / PAGE_SIZE)
  const pageListings = allListings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const premiumSponsors = mockListings.filter(l => l.tier === 'premium' && l.is_active)

  const stats = {
    listings:  mockListings.length,
    companies: new Set(mockListings.map(l => l.company_id)).size,
    placed:    1240,
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-navy py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 mb-6">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-300 text-xs font-medium">{stats.listings} opportunities live now</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Launch your career with the{' '}
            <span className="text-blue-400">right internship</span>
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
            LaunchPad connects college students with internships and co-ops at top companies — filtered for what matters to you.
          </p>
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Stats bar */}
        <div className="max-w-3xl mx-auto mt-10 grid grid-cols-3 gap-4">
          {[
            { icon: Briefcase,  value: stats.listings,                  label: 'Open Roles'       },
            { icon: Building2,  value: stats.companies,                 label: 'Companies'         },
            { icon: Users,      value: `${stats.placed.toLocaleString()}+`, label: 'Students Placed' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-blue-400" />
                <span className="font-heading font-bold text-2xl text-white">{value}</span>
              </div>
              <span className="text-white/40 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Premium sponsors strip ────────────────────────── */}
      {premiumSponsors.length > 0 && (
        <section className="border-b border-gray-200 bg-white py-5 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Crown className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Premium Partners
                </span>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                {premiumSponsors.map(l => l.companies && (
                  <a
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity group"
                  >
                    <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={l.companies.logo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(l.companies.name)}&size=64`}
                        alt={l.companies.name}
                        width={24}
                        height={24}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-navy transition-colors">
                      {l.companies.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Main content ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <Suspense fallback={null}>
                <FilterSidebar />
              </Suspense>
            </div>
          </div>

          {/* Listings */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {hasFilters
                  ? `${allListings.length} result${allListings.length !== 1 ? 's' : ''} found`
                  : `${allListings.length} open positions`}
              </p>
              {hasFilters && (
                <a href="/" className="text-sm text-blue-600 hover:text-blue-800">Clear filters</a>
              )}
            </div>

            {pageListings.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-gray-600 text-lg mb-2">No results found</h3>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pageListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            <Suspense fallback={null}>
              <Pagination currentPage={page} totalPages={totalPages} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
