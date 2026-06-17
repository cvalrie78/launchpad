import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ApplicantsTable } from './ApplicantsTable'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import type { Application } from '@/types'

interface Props { params: { id: string } }

export default async function ApplicantsPage({ params }: Props) {
  const supabase = createServiceClient()

  // Fetch listing + company
  const { data: listing, error: listingErr } = await supabase
    .from('listings')
    .select('*, companies(*)')
    .eq('id', params.id)
    .single()

  if (listingErr || !listing) notFound()

  // Fetch all applications for this listing with student info
  const { data: applications } = await supabase
    .from('applications')
    .select('*, students(*)')
    .eq('listing_id', params.id)
    .order('created_at', { ascending: false })

  const company = listing.companies as { name: string } | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy px-4 py-5 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading font-bold text-white text-xl">{listing.title}</h1>
              <p className="text-white/50 text-sm mt-1">{company?.name} · Applicants Dashboard</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white font-semibold">{applications?.length ?? 0}</span>
              <span className="text-white/50 text-sm">applicant{(applications?.length ?? 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!applications || applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-gray-600 text-lg mb-2">No applications yet</h3>
            <p className="text-gray-400 text-sm">Applications will appear here as students apply.</p>
          </div>
        ) : (
          <ApplicantsTable applications={applications as Application[]} listingId={params.id} />
        )}
      </div>
    </div>
  )
}
