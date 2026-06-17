import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export function Navbar() {
  return (
    <header className="bg-navy sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-white tracking-tight">LaunchPad</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">Browse Jobs</Link>
            <Link href="/companies/browse" className="text-sm text-white/70 hover:text-white transition-colors">Companies</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/post"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Post a Role
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
