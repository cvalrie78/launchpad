import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  sendApplicationConfirmationToStudent,
  sendNewApplicationAlertToEmployer,
} from '@/lib/email'

export async function POST(req: Request) {
  const supabase = createServiceClient()

  let body: {
    listing_id: string
    name: string
    email: string
    school: string
    major: string
    graduation_year: string
    cover_letter: string
    resume_path: string   // storage path returned after upload
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { listing_id, name, email, school, major, graduation_year, cover_letter, resume_path } = body

  if (!listing_id || !name || !email) {
    return NextResponse.json({ error: 'listing_id, name and email are required' }, { status: 400 })
  }

  // ── 1. Fetch listing + company (need employer contact) ────
  const { data: listing, error: listingErr } = await supabase
    .from('listings')
    .select('*, companies(*)')
    .eq('id', listing_id)
    .single()

  if (listingErr || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // ── 2. Upsert student ─────────────────────────────────────
  const resumeUrl = resume_path
    ? supabase.storage.from('resumes').getPublicUrl(resume_path).data.publicUrl
    : null

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .upsert(
      {
        email,
        name,
        school:          school || null,
        major:           major || null,
        graduation_year: graduation_year ? Number(graduation_year) : null,
        resume_url:      resumeUrl,
      },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select()
    .single()

  if (studentErr || !student) {
    return NextResponse.json({ error: studentErr?.message ?? 'Could not create student' }, { status: 500 })
  }

  // ── 3. Create application (guard duplicate) ───────────────
  const { data: application, error: appErr } = await supabase
    .from('applications')
    .insert({
      listing_id,
      student_id:   student.id,
      cover_letter: cover_letter || null,
      status:       'applied',
    })
    .select()
    .single()

  if (appErr) {
    // unique constraint violation = already applied
    if (appErr.code === '23505') {
      return NextResponse.json({ error: 'You have already applied to this listing.' }, { status: 409 })
    }
    return NextResponse.json({ error: appErr.message }, { status: 500 })
  }

  // ── 4. Send emails (non-blocking — don't fail the request) ─
  const company = listing.companies as { name: string; website: string } | null
  const employerEmail = listing.apply_email ?? null

  await Promise.allSettled([
    sendApplicationConfirmationToStudent({
      studentName:  name,
      studentEmail: email,
      listingTitle: listing.title,
      companyName:  company?.name ?? 'the company',
    }),
    employerEmail
      ? sendNewApplicationAlertToEmployer({
          employerEmail,
          studentName:  name,
          studentEmail: email,
          studentSchool: school || null,
          studentMajor:  major || null,
          listingTitle:  listing.title,
          listingId:     listing_id,
          applicationId: application.id,
        })
      : Promise.resolve(),
  ])

  return NextResponse.json({ application_id: application.id }, { status: 201 })
}
