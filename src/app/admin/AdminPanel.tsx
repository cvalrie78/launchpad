'use client'

import { useState } from 'react'
import { Eye, EyeOff, Star, StarOff, Shield, Briefcase, Users, Check, X, Clock, Crown } from 'lucide-react'
import { mockListings } from '@/lib/mock-data'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Badge } from '@/components/ui/Badge'
import { industryColor } from '@/lib/utils'
import type { Listing } from '@/types'
import Link from 'next/link'

// For the mock data demo, treat all listings as already active.
// In production the Supabase query replaces mockListings — see comment below.
const toMock = (listings: Listing[]) => listings

type Tab = 'pending' | 'active' | 'all'

export function AdminPanel() {
  const [password, setPassword]   = useState('')
  const [authed, setAuthed]       = useState(false)
  const [authError, setAuthError] = useState(false)
  const [listings, setListings]   = useState<Listing[]>(toMock(mockListings))
  const [tab, setTab]             = useState<Tab>('pending')

  // --- Supabase swap ---
  // On mount, fetch from Supabase with service key:
  // const { data } = await supabase.from('listings').select('*, companies(*)').order('created_at', { ascending: false })
  // setListings(data ?? [])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin123') { setAuthed(true); setAuthError(false) }
    else setAuthError(true)
  }

  const approve = async (id: string) => {
    // --- Supabase swap ---
    // await fetch(`/api/admin/listings/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'toggle_active' }) })
    setListings(ls => ls.map(l => l.id === id ? { ...l, is_active: true } : l))
  }

  const reject = async (id: string) => {
    // --- Supabase swap ---
    // await fetch(`/api/admin/listings/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'toggle_active' }) })
    setListings(ls => ls.filter(l => l.id !== id))
  }

  const toggleFeatured = async (id: string) => {
    setListings(ls => ls.map(l => l.id === id ? { ...l, is_featured: !l.is_featured } : l))
  }

  const toggleActive = async (id: string) => {
    setListings(ls => ls.map(l => l.id === id ? { ...l, is_active: !l.is_active } : l))
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-navy text-lg">Admin Panel</h1>
              <p className="text-xs text-gray-400">LaunchPad</p>
            </div>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setAuthError(false) }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${authError ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="Enter admin password"
                autoFocus
              />
              {authError && <p className="text-red-500 text-xs mt-1">Incorrect password</p>}
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">Demo password: admin123</p>
        </div>
      </div>
    )
  }

  const pending  = listings.filter(l => !l.is_active)
  const active   = listings.filter(l =>  l.is_active)
  const tabList  = tab === 'pending' ? pending : tab === 'active' ? active : listings

  const stats = {
    pending:  pending.length,
    active:   active.length,
    featured: listings.filter(l => l.is_featured).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy px-4 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-white text-lg">LaunchPad Admin</h1>
              <p className="text-white/40 text-xs">Listing approval & management</p>
            </div>
          </div>
          <button onClick={() => setAuthed(false)} className="text-white/50 hover:text-white text-sm transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Review', value: stats.pending, icon: Clock,    color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Active',         value: stats.active,  icon: Eye,      color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Featured',       value: stats.featured,icon: Star,     color: 'text-blue-600',  bg: 'bg-blue-50'  },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending approvals banner */}
        {stats.pending > 0 && tab !== 'pending' && (
          <div
            onClick={() => setTab('pending')}
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {stats.pending} listing{stats.pending !== 1 ? 's' : ''} waiting for approval
              </p>
              <p className="text-xs text-amber-600">Click to review</p>
            </div>
            <span className="w-6 h-6 bg-amber-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
              {stats.pending}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            { key: 'pending', label: `Pending (${stats.pending})` },
            { key: 'active',  label: `Active (${stats.active})`   },
            { key: 'all',     label: `All (${listings.length})`    },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? t.key === 'pending' ? 'bg-amber-500 text-white' : 'bg-navy text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {tabList.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {tab === 'pending' ? 'No listings pending approval — you\'re all caught up!' : 'No listings found.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Industry</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Tier</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Submitted</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Applicants</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Featured</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    {tab === 'pending' ? 'Action' : 'Active'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tabList.map(listing => (
                  <tr
                    key={listing.id}
                    className={`transition-colors ${!listing.is_active ? 'bg-amber-50/40' : 'hover:bg-gray-50'}`}
                  >
                    {/* Role */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CompanyLogo name={listing.companies?.name ?? 'Company'} logoUrl={listing.companies?.logo_url ?? null} size={36} />
                        <div>
                          <p className="text-sm font-medium text-navy">{listing.title}</p>
                          <p className="text-xs text-gray-400">{listing.companies?.name}</p>
                          {!listing.is_active && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium mt-0.5">
                              <Clock className="w-3 h-3" /> Pending review
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge label={listing.industry} color={industryColor(listing.industry)} />
                    </td>

                    {/* Tier */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {listing.tier === 'premium' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                          <Crown className="w-3 h-3" /> Premium
                        </span>
                      )}
                      {listing.tier === 'featured' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                      {(!listing.tier || listing.tier === 'standard') && (
                        <span className="text-xs text-gray-400">Standard</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">
                        {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Applicants link */}
                    <td className="px-5 py-4 text-center">
                      <Link
                        href={`/dashboard/listings/${listing.id}/applicants`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleFeatured(listing.id)}
                        title={listing.is_featured ? 'Remove featured' : 'Mark as featured'}
                        className={`p-2 rounded-lg transition-colors ${
                          listing.is_featured
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'
                        }`}
                      >
                        {listing.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Approve / Reject (pending) OR Active toggle (active) */}
                    <td className="px-5 py-4 text-center">
                      {!listing.is_active ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => approve(listing.id)}
                            title="Approve — make listing live"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => reject(listing.id)}
                            title="Reject & remove listing"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleActive(listing.id)}
                          title="Deactivate listing"
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
