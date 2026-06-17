import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'LaunchPad — Internships & Co-ops for College Students',
  description: 'Find the best internship and co-op opportunities at top companies. LaunchPad connects college students with employers hiring now.',
  openGraph: {
    title: 'LaunchPad — Internships & Co-ops for College Students',
    description: 'Find the best internship and co-op opportunities at top companies.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
