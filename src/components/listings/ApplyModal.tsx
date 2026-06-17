'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface ApplyModalProps {
  listingId: string
  listingTitle: string
  companyName: string
  onClose: () => void
}

type Step = 'form' | 'submitting' | 'success' | 'error'

interface FormState {
  name: string
  email: string
  school: string
  major: string
  graduation_year: string
  cover_letter: string
}

const CURRENT_YEAR = new Date().getFullYear()
const GRAD_YEARS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR + i)

export function ApplyModal({ listingId, listingTitle, companyName, onClose }: ApplyModalProps) {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<FormState>({
    name: '', email: '', school: '', major: '', graduation_year: '', cover_letter: '',
  })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof FormState, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const handleFile = useCallback((file: File | null) => {
    if (!file) return
    if (file.type !== 'application/pdf') { setResumeError('Only PDF files are accepted'); return }
    if (file.size > 5 * 1024 * 1024) { setResumeError('File must be under 5 MB'); return }
    setResumeError(null)
    setResumeFile(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }, [handleFile])

  const validate = (): boolean => {
    const e: Partial<FormState> = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!resumeFile) { setResumeError('Please upload your resume (PDF)'); }
    setErrors(e)
    return Object.keys(e).length === 0 && !!resumeFile
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setStep('submitting')
    setServerError(null)

    try {
      // 1. Upload resume
      const fd = new FormData()
      fd.append('file', resumeFile!)
      const uploadRes = await fetch('/api/resumes/upload', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error ?? 'Resume upload failed')

      // 2. Submit application
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, listing_id: listingId, resume_path: uploadData.path }),
      })
      const appData = await appRes.json()
      if (!appRes.ok) throw new Error(appData.error ?? 'Submission failed')

      setStep('success')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-heading font-bold text-navy text-lg leading-snug">Apply Now</h2>
            <p className="text-sm text-gray-500 mt-0.5">{listingTitle} · {companyName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-heading font-bold text-navy text-xl mb-2">Application Submitted!</h3>
              <p className="text-gray-500 text-sm mb-1">We&apos;ve sent a confirmation to <strong>{form.email}</strong>.</p>
              <p className="text-gray-400 text-sm mb-6">The employer will be in touch if you&apos;re selected.</p>
              <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Close
              </button>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-heading font-bold text-navy text-xl mb-2">Something went wrong</h3>
              <p className="text-gray-500 text-sm mb-6">{serverError}</p>
              <button onClick={() => setStep('form')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* Submitting */}
          {step === 'submitting' && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Submitting your application…</p>
              <p className="text-gray-400 text-sm mt-1">Uploading resume and sending confirmation email.</p>
            </div>
          )}

          {/* Form */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Jane Smith"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="jane@university.edu"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* School + Major */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">School</label>
                  <input
                    value={form.school}
                    onChange={e => set('school', e.target.value)}
                    placeholder="MIT"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Major</label>
                  <input
                    value={form.major}
                    onChange={e => set('major', e.target.value)}
                    placeholder="Computer Science"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Graduation year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Graduation Year</label>
                <select
                  value={form.graduation_year}
                  onChange={e => set('graduation_year', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select year</option>
                  {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Resume upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Resume (PDF, max 5 MB) <span className="text-red-500">*</span>
                </label>

                {resumeFile ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-blue-800 flex-1 truncate">{resumeFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setResumeFile(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="text-blue-400 hover:text-blue-600 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : resumeError
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-gray-400">PDF only · max 5 MB</p>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => handleFile(e.target.files?.[0] ?? null)}
                />
                {resumeError && <p className="text-red-500 text-xs mt-1">{resumeError}</p>}
              </div>

              {/* Cover letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.cover_letter}
                  onChange={e => set('cover_letter', e.target.value)}
                  placeholder="Tell the employer why you're a great fit for this role…"
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.cover_letter.length} characters</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Submit Application
              </button>

              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to share your information with {companyName}.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
