import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-navy border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">LaunchPad</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              The job board built for college students seeking internships and co-op opportunities at top companies.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Students</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-white/50 text-sm hover:text-white transition-colors">Browse Internships</Link></li>
              <li><Link href="/?type=co-op" className="text-white/50 text-sm hover:text-white transition-colors">Browse Co-ops</Link></li>
              <li><Link href="/?location=remote" className="text-white/50 text-sm hover:text-white transition-colors">Remote Roles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Employers</h4>
            <ul className="space-y-2.5">
              <li><Link href="/post" className="text-white/50 text-sm hover:text-white transition-colors">Post a Role</Link></li>
              <li><Link href="/post#featured" className="text-white/50 text-sm hover:text-white transition-colors">Featured Listings</Link></li>
              <li><Link href="/admin" className="text-white/50 text-sm hover:text-white transition-colors">Admin Panel</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} LaunchPad. All rights reserved.</p>
          <p className="text-white/30 text-xs">Built for students, by students.</p>
        </div>
      </div>
    </footer>
  )
}
