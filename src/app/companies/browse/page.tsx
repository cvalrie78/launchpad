import Link from 'next/link'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { mockCompanies, mockListings } from '@/lib/mock-data'
import { industryColor } from '@/lib/utils'

export default function CompaniesBrowsePage() {
  const companies = mockCompanies.map(c => ({
    ...c,
    openCount: mockListings.filter(l => l.company_id === c.id && l.is_active).length,
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-navy text-3xl mb-2">Companies Hiring Now</h1>
        <p className="text-gray-500">Browse companies actively posting internship and co-op opportunities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map(company => {
          const color = company.industry ? industryColor(company.industry) : '#6b7280'
          return (
            <Link key={company.id} href={`/companies/${company.id}`} className="group">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start gap-4 mb-4">
                  <CompanyLogo name={company.name} logoUrl={company.logo_url} size={52} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-navy group-hover:text-blue-700 transition-colors truncate">
                      {company.name}
                    </h3>
                    {company.industry && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1"
                        style={{ backgroundColor: `${color}18`, color, borderColor: `${color}40` }}
                      >
                        {company.industry}
                      </span>
                    )}
                  </div>
                </div>
                {company.description && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{company.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {company.openCount} open role{company.openCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">View →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
