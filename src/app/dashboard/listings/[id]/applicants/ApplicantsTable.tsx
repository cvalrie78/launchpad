'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Download, ChevronDown, FileText, Mail, GraduationCap, StickyNote, ExternalLink } from 'lucide-react'
import type { Application, ApplicationStatus } from '@/types'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/types'

interface Props {
  applications: Application[]
  listingId: string
}

const STATUSES: ApplicationStatus[] = ['applied', 'reviewed', 'interviewing', 'offered', 'rejected']

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${APPLICATION_STATUS_COLORS[status]}`}>
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  )
}

function ApplicantRow({ app, onStatusChange }: {
  app: Application
  onStatusChange: (id: string, status: ApplicationStatus) => Promise<void>
}) {
  const student = app.students!
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(app.employer_notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [, startTransition] = useTransition()

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      onStatusChange(app.id, e.target.value as ApplicationStatus)
    })
  }

  const saveNotes = async () => {
    setSavingNotes(true)
    await fetch(`/api/applications/${app.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employer_notes: notes }),
    })
    setSavingNotes(false)
  }

  const downloadResume = async () => {
    if (!student.resume_url) return
    setDownloadLoading(true)
    try {
      // Extract storage path from public URL or use as-is for signed URL
      const urlObj = new URL(student.resume_url)
      const path = urlObj.pathname.split('/object/public/')[1] ?? urlObj.pathname
      const res = await fetch(`/api/resumes/download?path=${encodeURIComponent(path)}`)
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch {
      // Fallback: open direct URL
      window.open(student.resume_url, '_blank')
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-700 font-semibold text-sm">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-navy text-sm">{student.name}</p>
            {student.graduation_year && (
              <span className="text-xs text-gray-400">Class of {student.graduation_year}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <a href={`mailto:${student.email}`} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Mail className="w-3 h-3" />{student.email}
            </a>
            {student.school && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />{student.school}{student.major ? ` · ${student.major}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Applied date */}
        <div className="hidden sm:block text-xs text-gray-400 flex-shrink-0">
          {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>

        {/* Status selector */}
        <div className="flex-shrink-0">
          <select
            value={app.status}
            onChange={handleStatusChange}
            className={`text-xs font-medium border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${APPLICATION_STATUS_COLORS[app.status]}`}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {student.resume_url && (
            <button
              onClick={downloadResume}
              disabled={downloadLoading}
              title="Download resume"
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Collapse' : 'Expand'}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
          {app.cover_letter && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cover Letter</p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white border border-gray-200 rounded-lg p-3">
                {app.cover_letter}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <StickyNote className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employer Notes</p>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add private notes about this applicant…"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="mt-2 px-4 py-1.5 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              {savingNotes ? 'Saving…' : 'Save Notes'}
            </button>
          </div>

          {student.resume_url && (
            <button
              onClick={downloadResume}
              disabled={downloadLoading}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              {downloadLoading ? 'Getting link…' : 'Open Resume (PDF)'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function ApplicantsTable({ applications: initial, listingId }: Props) {
  const [applications, setApplications] = useState<Application[]>(initial)
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    // Optimistic update
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status } : a))

    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      // Rollback on failure
      setApplications(apps => apps.map(a => a.id === id ? { ...a, status: initial.find(x => x.id === id)!.status } : a))
    }
  }

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length
    return acc
  }, {} as Record<ApplicationStatus, number>)

  const visible = statusFilter === 'all' ? applications : applications.filter(a => a.status === statusFilter)

  return (
    <div className="space-y-5">
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-navy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          All ({applications.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-navy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {APPLICATION_STATUS_LABELS[s]} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {/* Applicant rows */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-sm">No applicants with status &ldquo;{APPLICATION_STATUS_LABELS[statusFilter as ApplicationStatus]}&rdquo;</p>
          </div>
        ) : (
          visible.map(app => (
            <ApplicantRow key={app.id} app={app} onStatusChange={handleStatusChange} />
          ))
        )}
      </div>
    </div>
  )
}
