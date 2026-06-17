export type ListingType = 'internship' | 'co-op'
export type LocationType = 'remote' | 'hybrid' | 'on-site'
export type PayPeriod = 'hourly' | 'monthly' | 'stipend'
export type ApplicationStatus = 'applied' | 'reviewed' | 'interviewing' | 'offered' | 'rejected'
export type ListingTier = 'standard' | 'featured' | 'premium'

export interface Industry {
  id: number
  name: string
  slug: string
  color: string
}

export interface Company {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  description: string | null
  industry: string | null
  created_at: string
}

export interface Listing {
  id: string
  company_id: string
  title: string
  type: ListingType
  industry: string
  location_type: LocationType
  city: string | null
  state: string | null
  pay_rate: number | null
  pay_period: PayPeriod | null
  description: string
  requirements: string | null
  apply_url: string | null
  apply_email: string | null
  deadline: string | null
  tier: ListingTier
  is_featured: boolean
  is_active: boolean
  created_at: string
  companies?: Company
}

export interface Student {
  id: string
  email: string
  name: string
  school: string | null
  major: string | null
  graduation_year: number | null
  resume_url: string | null
  created_at: string
}

export interface Application {
  id: string
  listing_id: string
  student_id: string
  cover_letter: string | null
  status: ApplicationStatus
  employer_notes: string | null
  created_at: string
  students?: Student
  listings?: Listing & { companies?: Company }
}

export interface ListingFilters {
  industry?: string
  type?: ListingType
  location_type?: LocationType
  pay_min?: number
  search?: string
  page?: number
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied:      'Applied',
  reviewed:     'Reviewed',
  interviewing: 'Interviewing',
  offered:      'Offered',
  rejected:     'Rejected',
}

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied:      'bg-blue-50 text-blue-700 border-blue-200',
  reviewed:     'bg-purple-50 text-purple-700 border-purple-200',
  interviewing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  offered:      'bg-green-50 text-green-700 border-green-200',
  rejected:     'bg-red-50 text-red-600 border-red-200',
}
