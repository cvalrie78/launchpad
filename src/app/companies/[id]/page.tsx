import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, ExternalLink } from 'lucide-react'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { ListingCard } from '@/components/listings/ListingCard'
import { mockListings, mockCompanies } from '@/lib/mock-data'
import { industryColor } from '@/lib/utils'

interface Props {
  params: { id: string }
}

export default async function CompanyPage({ params }: Props) {
  // --- Supabase swap ---
  // const supabase = createClient()
  // const { data: company } = await supabase.from('companies').select('*').eq('id', params.id).single()
  // const { data: listings } = await supabase.from('listings').select('*, companies(*)').eq('company_id', params.id).eq('is_active', true)
  const company = mockCompanies.find(c => c.id === params.id)
  if (!company) notFound()

  const listings = mockListings.filter(l => l.company_id === company.id && l.is_active)
  const color = company.industry ? industryColor(company.industry) : '#6b7280'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      {/* Company header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          <CompanyLogo name={company.name} logoUrl={company.logo_url} size={80} />
          <div className="flex-1">
            <h1 className="font-heading font-bold text-navy text-3xl mb-2">{company.name}</h1>
            {company.industry && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4"
                style={{ backgroundColor: `${color}18`, color, borderColor: `${color}40` }}
              >
                {company.industry}
              </span>
            )}
            {company.description && (
              <p className="text-gray-600 leading-relaxed mb-4">{company.description}</p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                {company.website.replace('https://', '')}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="font-heading font-semibold text-navy text-xl mb-5">
          Open Positions <span className="text-gray-400 font-normal text-base">({listings.length})</span>
        </h2>
        {listings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No active listings at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return mockCompanies.map(c => ({ id: c.id }))
}
