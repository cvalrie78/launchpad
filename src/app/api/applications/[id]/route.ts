import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { ApplicationStatus } from '@/types'

interface Params { params: { id: string } }

// PATCH /api/applications/[id] — update status or employer notes
export async function PATCH(req: Request, { params }: Params) {
  const supabase = createServiceClient()
  const body = await req.json() as { status?: ApplicationStatus; employer_notes?: string }

  const allowed: ApplicationStatus[] = ['applied', 'reviewed', 'interviewing', 'offered', 'rejected']
  if (body.status && !allowed.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.status !== undefined)         update.status         = body.status
  if (body.employer_notes !== undefined) update.employer_notes = body.employer_notes

  const { data, error } = await supabase
    .from('applications')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
