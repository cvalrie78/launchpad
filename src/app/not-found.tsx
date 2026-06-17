import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="font-heading font-bold text-navy text-4xl mb-3">404</h1>
        <p className="text-gray-500 mb-8">This page doesn&apos;t exist or the listing has expired.</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Back to Job Board
        </Link>
      </div>
    </div>
  )
}
