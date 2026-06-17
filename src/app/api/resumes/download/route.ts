import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/resumes/download?path=resumes/filename.pdf
// Returns a short-lived signed URL (1 hour) so employers can download resumes
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(path, 3600)  // 1-hour signed URL

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}
