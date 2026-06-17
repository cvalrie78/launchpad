import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface Params { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const { action } = await req.json() as { action: 'toggle_featured' | 'toggle_active' }
  const supabase = createServiceClient()

  const { data: listing } = await supabase.from('listings').select('is_featured,is_active').eq('id', params.id).single()
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const update = action === 'toggle_featured'
    ? { is_featured: !listing.is_featured }
    : { is_active: !listing.is_active }

  const { data, error } = await supabase.from('listings').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
