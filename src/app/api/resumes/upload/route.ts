import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: Request) {
  const supabase = createServiceClient()
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 })

  const bytes    = await file.arrayBuffer()
  const buffer   = Buffer.from(bytes)
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const path     = `resumes/${filename}`

  const { error } = await supabase.storage
    .from('resumes')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ path })
}
