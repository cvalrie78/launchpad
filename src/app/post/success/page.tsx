import Link from 'next/link'
import { Check, Star } from 'lucide-react'

export default function PostSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="relative">
            <Check className="w-8 h-8 text-blue-600" />
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 absolute -top-2 -right-2" />
          </div>
        </div>
        <h1 className="font-heading font-bold text-navy text-2xl mb-3">You&apos;re Live!</h1>
        <p className="text-gray-500 mb-2">Your featured listing is now pinned at the top of LaunchPad for 30 days.</p>
        <p className="text-gray-400 text-sm mb-8">A confirmation has been sent to your email.</p>
        <div className="flex flex-col gap-3">
          <Link href="/" className="py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-center">
            View Job Board
          </Link>
          <Link href="/post" className="py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center">
            Post Another Role
          </Link>
        </div>
      </div>
    </div>
  )
}
