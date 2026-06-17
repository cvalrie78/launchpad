'use client'

import { useState } from 'react'
import { Check, ChevronRight, Building2, FileText, Eye, CreditCard, Star, Zap, Crown } from 'lucide-react'
import { INDUSTRY_COLORS } from '@/lib/utils'

const INDUSTRIES = Object.keys(INDUSTRY_COLORS)
const STEPS = ['Company Info', 'Listing Details', 'Review', 'Payment']

interface FormData {
  // Company
  companyName: string
  companyWebsite: string
  companyDescription: string
  companyIndustry: string
  // Listing
  title: string
  type: 'internship' | 'co-op' | ''
  industry: string
  locationType: 'remote' | 'hybrid' | 'on-site' | ''
  city: string
  state: string
  payRate: string
  payPeriod: 'hourly' | 'monthly' | 'stipend' | ''
  description: string
  requirements: string
  applyUrl: string
  applyEmail: string
  deadline: string
  // Payment
  tier: 'standard' | 'featured' | 'premium'
}

const TIER_CONFIG = {
  standard: {
    label: 'Standard',
    price: 'Free',
    icon: Zap,
    color: 'border-gray-300',
    selectedColor: 'border-gray-500 bg-gray-50',
    iconColor: 'text-gray-500',
    perks: ['Listed for 30 days', 'Full job description', 'Standard placement in results'],
  },
  featured: {
    label: 'Featured',
    price: '$49',
    icon: Star,
    color: 'border-blue-200',
    selectedColor: 'border-blue-500 bg-blue-50',
    iconColor: 'text-blue-600',
    perks: ['Everything in Standard', 'Pinned above standard listings', 'Blue accent highlight on card', '~3× more student views'],
  },
  premium: {
    label: 'Premium',
    price: '$99',
    icon: Crown,
    color: 'border-purple-200',
    selectedColor: 'border-purple-500 bg-purple-50',
    iconColor: 'text-purple-600',
    perks: ['Everything in Featured', 'Logo in Premium Partners strip', 'Purple card highlight', 'Top of all results'],
  },
} as const

const initial: FormData = {
  companyName: '', companyWebsite: '', companyDescription: '', companyIndustry: '',
  title: '', type: '', industry: '', locationType: '', city: '', state: '',
  payRate: '', payPeriod: '', description: '', requirements: '', applyUrl: '', applyEmail: '', deadline: '',
  tier: 'standard',
}

function StepIndicator({ step, current }: { step: number; current: number }) {
  const done = current > step
  const active = current === step
  return (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
        done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'
      }`}>
        {done ? <Check className="w-4 h-4" /> : step + 1}
      </div>
      <span className={`ml-2 text-sm font-medium hidden sm:block ${active ? 'text-navy' : done ? 'text-blue-600' : 'text-gray-400'}`}>
        {STEPS[step]}
      </span>
    </div>
  )
}

export function PostingWizard() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initial)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))
  const err = (k: keyof FormData) => errors[k] ? (
    <p className="text-red-500 text-xs mt-1">{errors[k]}</p>
  ) : null

  const validateStep = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (step === 0) {
      if (!form.companyName.trim()) e.companyName = 'Company name is required'
      if (!form.companyWebsite.trim()) e.companyWebsite = 'Website is required'
    }
    if (step === 1) {
      if (!form.title.trim()) e.title = 'Job title is required'
      if (!form.type) e.type = 'Select a role type'
      if (!form.industry) e.industry = 'Select an industry'
      if (!form.locationType) e.locationType = 'Select a location type'
      if (!form.description.trim()) e.description = 'Description is required'
      if (!form.applyUrl && !form.applyEmail) e.applyUrl = 'Provide an apply URL or email'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validateStep()) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (form.tier === 'featured' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setSubmitted(true)
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-heading font-bold text-navy text-2xl mb-3">Listing Submitted!</h2>
        <p className="text-gray-500 mb-6">
          Your listing is <strong>pending review</strong> and will go live once approved — usually within 24 hours.
          We&apos;ll notify you at the email you provided.
        </p>
        <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          View Job Board
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Step header */}
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-4">
          {STEPS.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <StepIndicator step={i} current={step} />
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Step 0: Company Info */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="font-heading font-semibold text-navy text-xl">Company Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Acme Corp" />
              {err('companyName')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Website <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.companyWebsite} onChange={e => set('companyWebsite', e.target.value)} placeholder="https://acmecorp.com" type="url" />
              {err('companyWebsite')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Description</label>
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={form.companyDescription} onChange={e => set('companyDescription', e.target.value)}
                placeholder="Brief description of what your company does..." rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.companyIndustry} onChange={e => set('companyIndustry', e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Listing Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="font-heading font-semibold text-navy text-xl">Listing Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title} onChange={e => set('title', e.target.value)} placeholder="Software Engineering Intern" />
              {err('title')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Type <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="">Select type</option>
                  <option value="internship">Internship</option>
                  <option value="co-op">Co-op</option>
                </select>
                {err('type')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                {err('industry')}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Type <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.locationType} onChange={e => set('locationType', e.target.value)}>
                  <option value="">Select</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                </select>
                {err('locationType')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.state} onChange={e => set('state', e.target.value)} placeholder="NY" maxLength={2} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Rate</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.payRate} onChange={e => set('payRate', e.target.value)} placeholder="25" type="number" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Period</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.payPeriod} onChange={e => set('payPeriod', e.target.value)}>
                  <option value="">Select</option>
                  <option value="hourly">Hourly</option>
                  <option value="monthly">Monthly</option>
                  <option value="stipend">Stipend (total)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Description <span className="text-red-500">*</span></label>
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the role, responsibilities, and what the student will gain..." rows={6} />
              {err('description')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Requirements</label>
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={form.requirements} onChange={e => set('requirements', e.target.value)}
                placeholder="GPA requirements, major, skills, eligibility..." rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apply URL</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.applyUrl} onChange={e => set('applyUrl', e.target.value)} placeholder="https://..." type="url" />
                {err('applyUrl')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Or Apply Email</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.applyEmail} onChange={e => set('applyEmail', e.target.value)} placeholder="hr@company.com" type="email" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Application Deadline</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.deadline} onChange={e => set('deadline', e.target.value)} type="date" />
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-blue-600" />
              <h2 className="font-heading font-semibold text-navy text-xl">Review Your Listing</h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-navy">{form.title}</h3>
              <p className="text-sm text-gray-600">{form.companyName} · {form.industry}</p>
              <p className="text-sm text-gray-600">{form.locationType}{form.city ? ` · ${form.city}, ${form.state}` : ''}</p>
              {form.payRate && <p className="text-sm text-gray-600">Pay: {form.payRate}/{form.payPeriod}</p>}
              {form.deadline && <p className="text-sm text-gray-600">Deadline: {form.deadline}</p>}
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Description preview</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line line-clamp-4">{form.description}</p>
            </div>

            {/* Tier selection */}
            <div>
              <h3 className="font-semibold text-navy mb-1">Choose Your Plan</h3>
              <p className="text-sm text-gray-400 mb-4">All plans include a 30-day active listing and full applicant management.</p>
              <div className="grid grid-cols-1 gap-3">
                {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG[keyof typeof TIER_CONFIG]][]).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  const isSelected = form.tier === key
                  return (
                    <button
                      key={key}
                      onClick={() => set('tier', key)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${isSelected ? cfg.selectedColor : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                        <span className="font-semibold text-navy text-base">{cfg.label}</span>
                        <span className={`ml-auto text-lg font-bold ${key === 'premium' ? 'text-purple-600' : key === 'featured' ? 'text-blue-600' : 'text-gray-600'}`}>
                          {cfg.price}
                        </span>
                        {isSelected && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      </div>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {cfg.perks.map(p => (
                          <li key={p} className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="font-heading font-semibold text-navy text-xl">
                {form.tier === 'standard' ? 'Confirm & Submit' : 'Complete Payment'}
              </h2>
            </div>

            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-navy">
                    {TIER_CONFIG[form.tier].label} Listing
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{form.title} · {form.companyName}</p>
                  <p className="text-xs text-gray-400 mt-1">30-day active listing · pending admin approval</p>
                </div>
                <span className={`text-xl font-bold ${
                  form.tier === 'premium' ? 'text-purple-600' : form.tier === 'featured' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {TIER_CONFIG[form.tier].price}
                </span>
              </div>

              {/* What they're getting */}
              <div className="border-t border-gray-200 pt-3">
                <ul className="space-y-1.5">
                  {TIER_CONFIG[form.tier].perks.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {form.tier !== 'standard' && (
              <div className={`rounded-xl p-4 text-sm border ${
                form.tier === 'premium'
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <p className="font-medium mb-1">You&apos;ll be redirected to Stripe</p>
                <p className="opacity-80">Secure payment by Stripe. Your listing is submitted for admin review immediately — the tier upgrade activates upon approval.</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-3.5 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                form.tier === 'premium'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : form.tier === 'featured'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-navy hover:bg-navy/90'
              }`}
            >
              {submitting
                ? 'Processing…'
                : form.tier === 'premium'
                ? 'Pay $99 & Submit'
                : form.tier === 'featured'
                ? 'Pay $49 & Submit'
                : 'Submit Free Listing'}
            </button>

            <p className="text-xs text-center text-gray-400">
              All listings go live only after admin approval — usually within 24 hours.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 0 ? (
            <button onClick={back} className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Back
            </button>
          ) : <div />}

          {step < 3 && (
            <button onClick={next} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
